import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function bootstrap() {
  console.log('📅 Fixing challenge dates in DB...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  const now = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(now.getDate() + 30);

  try {
    const result = await prisma.challenge.updateMany({
      where: { endAt: null },
      data: {
        startAt: now,
        endAt: thirtyDaysLater,
      },
    });

    console.log(`✅ Updated ${result.count} challenges with a 30-day duration.`);
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();
