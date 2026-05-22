import { NestFactory } from '@nestjs/core';
import { io, Socket } from 'socket.io-client';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

type TestUser = {
  id: string;
  username: string | null;
  email: string;
};

type TestClient = {
  user: TestUser;
  socket: Socket;
  battleId?: string;
};

const SERVER_URL = process.env.BATTLE_SERVER_URL ?? 'http://localhost:3000/battle';
const EXISTING_USERS = Number(process.env.EXISTING_USERS ?? '50');
const NEW_USERS = Number(process.env.NEW_USERS ?? '50');
const JOIN_SPACING_MS = Number(process.env.JOIN_SPACING_MS ?? '120');
const MATCH_TIMEOUT_MS = Number(process.env.MATCH_TIMEOUT_MS ?? '120000');
const DISCONNECT_SPACING_MS = Number(process.env.DISCONNECT_SPACING_MS ?? '120');

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function connectSocket(socket: Socket, label: string) {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out connecting socket for ${label}`));
    }, 10000);

    socket.once('connect', () => {
      clearTimeout(timeout);
      resolve();
    });

    socket.once('connect_error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function createNewUsers(prisma: PrismaService, count: number) {
  if (count <= 0) {
    return [] as TestUser[];
  }

  const runId = Date.now().toString(36);
  const passwordHash = await bcrypt.hash(`BattleTest-${runId}`, 10);

  return Promise.all(
    Array.from({ length: count }, (_, index) =>
      prisma.user.create({
        data: {
          email: `battle-test-${runId}-${index}@example.com`,
          username: `battle_test_${runId}_${index}`,
          password: passwordHash,
          isActivate: true,
          userLevel: {
            create: {},
          },
        },
        select: {
          id: true,
          username: true,
          email: true,
        },
      }),
    ),
  );
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const sockets: Socket[] = [];

  try {
    const existingUsers = await prisma.user.findMany({
      take: EXISTING_USERS,
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (existingUsers.length === 0) {
      throw new Error('No existing users were found in the database.');
    }

    const newUsers = await createNewUsers(prisma, NEW_USERS);
    const users = [...existingUsers, ...newUsers];

    if (users.length < 2) {
      throw new Error('Need at least 2 total users to run the battle stress test.');
    }

    const clients: TestClient[] = users.map((user) => ({
      user,
      socket: io(SERVER_URL, {
        query: { userId: user.id },
        transports: ['websocket'],
        reconnection: false,
      }),
    }));

    sockets.push(...clients.map((client) => client.socket));

    await Promise.all(
      clients.map((client) => connectSocket(client.socket, client.user.username ?? client.user.email)),
    );

    console.log(`Connected ${clients.length} players to ${SERVER_URL}`);

    const battleGroups = new Map<string, TestClient[]>();
    const matchedBattleIds = new Set<string>();

    for (const client of clients) {
      const label = client.user.username ?? client.user.email;

      client.socket.on('queue_joined', (data) => {
        console.log(`[${label}] queue_joined: ${data.message}`);
      });

      client.socket.on('match_found', (data) => {
        if (!data?.battleId) {
          return;
        }

        client.battleId = data.battleId;
        matchedBattleIds.add(data.battleId);

        const current = battleGroups.get(data.battleId) ?? [];
        if (!current.includes(client)) {
          current.push(client);
        }
        battleGroups.set(data.battleId, current);

        console.log(`[${label}] match_found: ${data.battleId}`);
      });

      client.socket.on('battle_ended', (data) => {
        console.log(
          `[${label}] battle_ended: ${data.battleId} winner=${data.winnerId} endAt=${data.battleEndAt}`,
        );
      });

      client.socket.on('disconnect', () => {
        console.log(`[${label}] disconnected`);
      });
    }

    const expectedMatches = Math.floor(clients.length / 2);

    for (const client of clients) {
      client.socket.emit('join_queue', {
        userId: client.user.id,
        username: client.user.username ?? client.user.email,
      });
      await sleep(JOIN_SPACING_MS);
    }

    const startedAt = Date.now();
    while (matchedBattleIds.size < expectedMatches) {
      if (Date.now() - startedAt > MATCH_TIMEOUT_MS) {
        throw new Error(
          `Timed out waiting for matches. Expected ${expectedMatches}, got ${matchedBattleIds.size}.`,
        );
      }

      await sleep(250);
    }

    console.log(`Matched ${matchedBattleIds.size}/${expectedMatches} battles. Checking database state...`);

    for (const group of battleGroups.values()) {
      if (group.length < 2) {
        continue;
      }

      group[0].socket.disconnect();
      await sleep(DISCONNECT_SPACING_MS);
      group[1].socket.disconnect();
      await sleep(DISCONNECT_SPACING_MS);
    }

    await sleep(2000);

    const battles = await prisma.battle.findMany({
      where: {
        id: {
          in: Array.from(matchedBattleIds),
        },
      },
      select: {
        id: true,
        winnerId: true,
        battleEndAt: true,
      },
    });

    const completedBattles = battles.filter((battle) => battle.winnerId && battle.battleEndAt);

    console.log(`Completed battles in DB: ${completedBattles.length}/${matchedBattleIds.size}`);

    if (completedBattles.length !== matchedBattleIds.size) {
      const missing = battles.filter((battle) => !battle.winnerId || !battle.battleEndAt);
      console.log('Battles missing winner/end time:', missing);
      throw new Error('Some battle rows did not receive winnerId and battleEndAt.');
    }

    console.log('Battle stress test completed successfully.');
  } finally {
    for (const socket of sockets) {
      if (socket.connected) {
        socket.disconnect();
      }
    }

    await app.close();
  }
}

main().catch((error) => {
  console.error('Battle stress test failed:', error);
  process.exit(1);
});