import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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
  server: Server;

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
    const match = this.battleService.findMatch();
    if (match) {
      const { player1, player2 } = match;

      // Create battle in DB
      const battle = await this.battleService.createBattle(
        player1.userId,
        player2.userId,
      );

      // Create a unique room for this battle
      const roomId = `battle_${battle.id}`;
      
      const socket1 = this.server.sockets.get(player1.socketId);
      const socket2 = this.server.sockets.get(player2.socketId);

      if (socket1) socket1.join(roomId);
      if (socket2) socket2.join(roomId);

      // Notify players
      this.server.to(roomId).emit('match_found', {
        battleId: battle.id,
        roomId,
        players: [
          { userId: player1.userId, username: player1.username },
          { userId: player2.userId, username: player2.username },
        ],
      });

      console.log(`Match found between ${player1.username} and ${player2.username}`);
    }
  }
}
