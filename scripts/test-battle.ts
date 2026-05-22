import { io, Socket } from 'socket.io-client';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function testBattle() {
  const SERVER_URL = 'http://localhost:3000/battle';

  console.log('🚀 Initializing Test Environment...');
  
  // Use NestFactory to get the PrismaService with the correct configuration
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  console.log('⚔️  Starting Battle Matchmaking Test...');

  try {
    // 1. Fetch two real users from the database
    const users = await prisma.user.findMany({
      take: 2,
      select: { id: true, username: true }
    });

    if (users.length < 2) {
      console.error('❌ Error: Need at least 2 users in the database to run this test.');
      process.exit(1);
    }

    const user1 = { userId: users[0].id, username: users[0].username };
    const user2 = { userId: users[1].id, username: users[1].username };

    console.log(`👤 Testing with: ${user1.username} and ${user2.username}`);

    // 2. Connect both users
    const socket1: Socket = io(SERVER_URL, { query: { userId: user1.userId } });
    const socket2: Socket = io(SERVER_URL, { query: { userId: user2.userId } });

    const connectSocket = (socket: Socket, name: string) => {
      return new Promise<void>((resolve) => {
        socket.on('connect', () => {
          console.log(`✅ ${name} connected (ID: ${socket.id})`);
          resolve();
        });
      });
    };

    await Promise.all([
      connectSocket(socket1, 'Player 1'),
      connectSocket(socket2, 'Player 2'),
    ]);

    // 3. Listen for matchmaking events
    socket1.on('queue_joined', (data) => console.log(`📩 Player 1: ${data.message}`));
    socket2.on('queue_joined', (data) => console.log(`📩 Player 2: ${data.message}`));

    socket1.on('match_found', (data) => {
      console.log('🎉 Player 1: Match Found!');
      console.log('📦 Battle Data:', JSON.stringify(data, null, 2));
    });

    socket2.on('match_found', (data) => {
      console.log('🎉 Player 2: Match Found!');
    });

    // 4. Join queue
    console.log('🚀 Both players joining the queue...');
    socket1.emit('join_queue', user1);
    
    // Small delay to simulate real user behavior
    setTimeout(() => {
      socket2.emit('join_queue', user2);
    }, 500);

    // 5. Keep script alive for a few seconds to see the match
    setTimeout(async () => {
      console.log('🏁 Test finished. Closing connections.');
      socket1.disconnect();
      socket2.disconnect();
      await app.close();
      process.exit(0);
    }, 5000);

  } catch (error) {
    console.error('❌ Test failed:', error);
    await app.close();
    process.exit(1);
  }
}

testBattle();
