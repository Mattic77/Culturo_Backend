import { io, Socket } from 'socket.io-client';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function testFullBattle() {
  const SERVER_URL = 'http://localhost:3000/battle';

  console.log('🚀 Initializing Test Environment...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  console.log('⚔️  Starting Full Battle Simulation...');

  try {
    const users = await prisma.user.findMany({
      take: 2,
      select: { id: true, username: true }
    });

    if (users.length < 2) {
      console.error('❌ Error: Need at least 2 users.');
      process.exit(1);
    }

    const user1 = { userId: users[0].id, username: users[0].username };
    const user2 = { userId: users[1].id, username: users[1].username };

    console.log(`👤 Players: ${user1.username} vs ${user2.username}`);

    const socket1: Socket = io(SERVER_URL, { query: { userId: user1.userId } });
    const socket2: Socket = io(SERVER_URL, { query: { userId: user2.userId } });

    let currentRoomId = '';

    const setupPlayer = (socket: Socket, user: any, name: string) => {
      socket.on('connect', () => console.log(`✅ ${name} connected`));
      
      socket.on('match_found', (data) => {
        console.log(`🎉 ${name}: Match Found! Room: ${data.roomId}`);
        currentRoomId = data.roomId;
      });

      socket.on('battle_started', (data) => console.log(`🚀 ${name}: ${data.message}`));

      socket.on('new_question', (data) => {
        console.log(`❓ ${name}: Question ${data.questionNumber}/${data.totalQuestions}: ${data.question.question}`);
        
        // Simulate thinking time
        const thinkingTime = Math.random() * 2000 + 1000; 
        
        setTimeout(() => {
          // Always pick a random option or use the answer (50% chance correct)
          const willBeCorrect = Math.random() > 0.5;
          const answer = willBeCorrect ? 'correct_answer_placeholder' : 'wrong'; 
          
          // In a real scenario we'd need the actual answer if we wanted to test "correctness" 
          // but here we just want to see the flow. 
          // Actually, the server doesn't send the answer, so we just send something.
          socket.emit('submit_answer', { roomId: currentRoomId, answer: data.question.id }); // Just sending ID as dummy answer
          console.log(`📤 ${name} submitted answer.`);
        }, thinkingTime);
      });

      socket.on('answer_result', (data) => {
        console.log(`📊 ${name}: Result -> ${data.isCorrect ? '✅' : '❌'} (+${data.points} pts). Total: ${data.currentScore}`);
      });

      socket.on('round_ended', (data) => {
        console.log(`🔔 Round Ended. Correct Answer: ${data.correctAnswer}`);
      });

      socket.on('battle_finished', (data) => {
        console.log(`🏆 ${name}: Battle Finished! Winner ID: ${data.winnerId}`);
        console.log('Final Scores:', JSON.stringify(data.finalScores, null, 2));
      });
    };

    setupPlayer(socket1, user1, 'Player 1');
    setupPlayer(socket2, user2, 'Player 2');

    // Start
    setTimeout(() => {
      console.log('🚀 Joining queue...');
      socket1.emit('join_queue', user1);
      socket2.emit('join_queue', user2);
    }, 1000);

    // Keep alive for the whole game (15 questions * ~5s each = 75s)
    setTimeout(async () => {
      console.log('🏁 Simulation Timeout. Closing.');
      socket1.disconnect();
      socket2.disconnect();
      await app.close();
      process.exit(0);
    }, 120000); // 2 minutes max

  } catch (error) {
    console.error('❌ Test failed:', error);
    await app.close();
    process.exit(1);
  }
}

testFullBattle();
