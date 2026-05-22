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
import { BattleService, WaitingPlayer, BattleState } from './battle.service';

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
    client.emit('queue_joined', { message: 'Searching for an opponent...' });
    this.tryMatch();
  }

  private async tryMatch() {
    const match = this.battleService.findMatch();
    if (match) {
      const { player1, player2 } = match;

      // Initialize battle logic
      const state = await this.battleService.initializeBattle(player1, player2);

      // Fix Socket.io v4 access with casting to bypass type issues
      const socket1 = (this.server.sockets as any).get(player1.socketId) as Socket;
      const socket2 = (this.server.sockets as any).get(player2.socketId) as Socket;

      if (socket1) socket1.join(state.roomId);
      if (socket2) socket2.join(state.roomId);

      // Notify players
      this.server.to(state.roomId).emit('match_found', {
        battleId: state.battleId,
        roomId: state.roomId,
        players: state.players.map(p => ({ userId: p.userId, username: p.username })),
      });

      // Start the battle automatically after 3 seconds
      setTimeout(() => {
        this.startBattle(state.roomId);
      }, 3000);
    }
  }

  private startBattle(roomId: string) {
    const state = this.battleService.getBattleState(roomId);
    if (!state) return;

    state.status = 'IN_PROGRESS';
    this.battleService.updateBattleState(roomId, state);

    this.server.to(roomId).emit('battle_started', { message: 'Battle is starting!' });
    this.sendNextQuestion(roomId);
  }

  private sendNextQuestion(roomId: string) {
    const state = this.battleService.getBattleState(roomId);
    if (!state || state.status !== 'IN_PROGRESS') return;

    if (state.currentQuestionIndex >= state.questions.length) {
      this.finishBattle(roomId);
      return;
    }

    const question = state.questions[state.currentQuestionIndex];
    // Remove answer before sending
    const { answer, ...safeQuestion } = question;

    state.roundStartTime = Date.now();
    state.players.forEach(p => p.hasAnswered = false);
    this.battleService.updateBattleState(roomId, state);

    this.server.to(roomId).emit('new_question', {
      question: safeQuestion,
      questionNumber: state.currentQuestionIndex + 1,
      totalQuestions: state.questions.length,
    });
  }

  @SubscribeMessage('submit_answer')
  async handleSubmitAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; answer: string },
  ) {
    const state = this.battleService.getBattleState(data.roomId);
    if (!state || state.status !== 'IN_PROGRESS') return;

    const player = state.players.find(p => p.socketId === client.id);
    if (!player || player.hasAnswered) return;

    const timeTaken = Date.now() - state.roundStartTime;
    const currentQuestion = state.questions[state.currentQuestionIndex];
    
    // Safety check for question
    if (!currentQuestion) return;

    const isCorrect = currentQuestion.answer.toLowerCase().trim() === data.answer.toLowerCase().trim();

    const points = this.battleService.calculatePoints(isCorrect, timeTaken);
    player.score += points;
    player.hasAnswered = true;

    this.battleService.updateBattleState(data.roomId, state);

    // Notify the player individually about their result
    client.emit('answer_result', { isCorrect, points, currentScore: player.score });

    // Check if both players answered
    const allAnswered = state.players.every(p => p.hasAnswered);
    if (allAnswered) {
      this.proceedToNextRound(data.roomId);
    }
  }

  private proceedToNextRound(roomId: string) {
    const state = this.battleService.getBattleState(roomId);
    if (!state) return;

    // Send intermediate scores to both
    this.server.to(roomId).emit('round_ended', {
      scores: state.players.map(p => ({ username: p.username, score: p.score })),
      correctAnswer: state.questions[state.currentQuestionIndex].answer
    });

    state.currentQuestionIndex++;
    this.battleService.updateBattleState(roomId, state);

    // Brief pause before next question
    setTimeout(() => {
      this.sendNextQuestion(roomId);
    }, 2000);
  }

  private async finishBattle(roomId: string) {
    const state = this.battleService.getBattleState(roomId);
    if (!state) return;

    state.status = 'FINISHED';
    
    // Determine winner
    const p1 = state.players[0];
    const p2 = state.players[1];
    let winnerId: string | null = null;
    if (p1.score > p2.score) winnerId = p1.userId;
    else if (p2.score > p1.score) winnerId = p2.userId;

    await this.battleService.finalizeBattle(state.battleId, winnerId);

    this.server.to(roomId).emit('battle_finished', {
      winnerId,
      finalScores: state.players.map(p => ({ userId: p.userId, username: p.username, score: p.score })),
    });

    this.battleService.removeBattleState(roomId);
  }
}
