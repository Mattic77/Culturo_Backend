import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ChallengeStatus } from '@prisma/client';

async function bootstrap() {
  console.log('🚀 Injecting Challenges only...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  const challenges = [
    {
      description: 'History Explorer',
      subtitle: 'Complete 10 history quizzes',
      status: ChallengeStatus.PENDING,
      score: 100,
      isPublic: true,
    },
    {
      description: 'Geography Master',
      subtitle: 'Complete 20 geography quizzes',
      status: ChallengeStatus.STARTED,
      score: 250,
      isPublic: true,
    },
    {
      description: 'Secret Quest',
      subtitle: 'Hidden challenge for elite players',
      status: ChallengeStatus.PENDING,
      score: 500,
      isPublic: false,
    },
  ];

  try {
    for (const challenge of challenges) {
      const existing = await prisma.challenge.findFirst({
        where: { description: challenge.description },
      });

      if (!existing) {
        await prisma.challenge.create({
          data: challenge,
        });
        console.log(`✅ Created challenge: ${challenge.description}`);
      } else {
        console.log(`⏩ Challenge already exists: ${challenge.description}`);
      }
    }
    console.log('\n✨ Injection complete!');
  } catch (error) {
    console.error('❌ Injection failed:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();
