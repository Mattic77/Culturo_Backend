import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { BattleService, WaitingPlayer } from './battle.service';
import { UseGuards } from '@nestjs/common';
// Note: You'll need to create a WsAuthGuard later to handle JWT in WebSockets
// For now, we'll implement a basic connection handler

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'battle',
})
export class BattleGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Namespace;

  constructor(private readonly battleService: BattleService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Use a custom property or token to identify the user
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.battleService.removeFromQueue(userId);
      void this.battleService.handlePlayerDisconnect(userId).then((battle) => {
        if (battle) {
          const roomId = `battle_${battle.id}`;
          this.server.to(roomId).emit('battle_ended', {
            battleId: battle.id,
            winnerId: battle.winnerId,
            battleEndAt: battle.battleEndAt,
          });
          console.log(`Battle ${battle.id} ended. Winner: ${battle.winnerId}`);
        }
      });
    }
  }

  @SubscribeMessage('join_queue')
  handleJoinQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; username: string },
  ) {
    const player: WaitingPlayer = {
      userId: data.userId,
      socketId: client.id,
      username: data.username,
      joinedAt: new Date(),
    };

    this.battleService.addToQueue(player);
    console.log(`Player ${data.username} joined the queue`);

    // Emit confirmation
    client.emit('queue_joined', { message: 'Searching for an opponent...' });

    // Try to match
    this.tryMatch();
  }

  private async tryMatch() {
    console.log('Checking for match...');
    const match = this.battleService.findMatch();
    if (match) {
      const { player1, player2 } = match;
      console.log(
        `Found match between ${player1.username} and ${player2.username}`,
      );

      try {
        // Create battle in DB
        const battle = await this.battleService.createBattle(
          player1.userId,
          player2.userId,
        );
        console.log(`Battle created in DB with ID: ${battle.id}`);

        // Create a unique room for this battle
        const roomId = `battle_${battle.id}`;

        this.battleService.registerBattle(
          battle.id,
          player1.userId,
          player2.userId,
          roomId,
        );

        const socket1 = this.server.sockets.get(player1.socketId);
        const socket2 = this.server.sockets.get(player2.socketId);

        if (socket1) {
          socket1.join(roomId);
          console.log(`Socket 1 (${player1.username}) joined room ${roomId}`);
        } else {
          console.error(`Socket 1 not found for ID: ${player1.socketId}`);
        }

        if (socket2) {
          socket2.join(roomId);
          console.log(`Socket 2 (${player2.username}) joined room ${roomId}`);
        } else {
          console.error(`Socket 2 not found for ID: ${player2.socketId}`);
        }

        // Notify players
        const payload = {
          battleId: battle.id,
          roomId,
          players: [
            { userId: player1.userId, username: player1.username },
            { userId: player2.userId, username: player2.username },
          ],
        };

        console.log(`Emitting match_found to room ${roomId}`);
        this.server.to(roomId).emit('match_found', payload);
      } catch (error) {
        console.error('Error creating battle or joining room:', error);
      }
    } else {
      console.log('No match found yet.');
    }
  }
}
