import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // Enable CORS for frontend access
  app.enableCors({
    origin: true, // Allows all origins or specific one if you provide a string/array
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Culturo API')
    .setDescription('The Culturo API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('battle', `
      REST endpoints and WebSocket guide for the Battle module.
      
      🎮 **BATTLE WORKFLOW (Socket.io)** 🎮
      Battles are real-time duels in the \`/battle\` namespace.
      
      **1. Connection:** Connect to \`/battle?userId=UUID\`
      **2. Matchmaking:** 
         - Emit \`join_queue\` { username }
         - Listen for \`match_found\` { battleId, roomId, players }
      **3. Playing:** 
         - Listen for \`new_question\` { question, questionNumber, totalQuestions }
         - Emit \`submit_answer\` { roomId, answer }
         - Listen for \`round_ended\` { scores, correctAnswer }
      **4. Finish:** 
         - Listen for \`battle_finished\` { winnerId, finalScores }
    `)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
