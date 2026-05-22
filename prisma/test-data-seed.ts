import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Usertype, Difficulty } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  console.log('🚀 Starting Test Data Generation (50 Users + Progression)...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // 1. Fetch some categories and countries to link games to
    const categories = await prisma.category.findMany();
    const countries = await prisma.country.findMany({ take: 10 });

    if (categories.length === 0 || countries.length === 0) {
      console.error('❌ Error: Categories or Countries missing. Run main seed first.');
      return;
    }

    const bronzeRank = await prisma.ranked.findFirst({ where: { name: 'Bronze' } });

    for (let i = 1; i <= 50; i++) {
      const email = `testuser${i}@example.com`;
      const username = `Player_${i}`;

      // Check if user already exists
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Create User with Level
        user = await prisma.user.create({
          data: {
            email,
            username,
            password: hashedPassword,
            isActivate: true,
            userType: Usertype.user,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
            userLevel: {
              create: {
                xp: 1200, 
                level: 2,
                isBattleUnlocked: true
              }
            }
          }
        });

        // Create some fake game history for this user
        const gameCount = Math.floor(Math.random() * 3) + 2; // 2 to 5 games
        for (let g = 0; g < gameCount; g++) {
          await prisma.games.create({
            data: {
              userId: user.id,
              categoryId: categories[Math.floor(Math.random() * categories.length)].id,
              countryId: countries[Math.floor(Math.random() * countries.length)].id,
              difficulty: Difficulty.Medium,
              score: Math.floor(Math.random() * 15),
              playedAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
            }
          });
        }

        // Initialize Online Rank
        if (bronzeRank) {
          await prisma.userRankOnline.create({
            data: {
              userId: user.id,
              rankId: bronzeRank.id,
              points: Math.floor(Math.random() * 500)
            }
          });
        }
      }

      if (i % 10 === 0) console.log(`✅ Processed ${i} users...`);
    }

    console.log('🏁 Finished generating 50 battle-ready users!');
  } catch (error) {
    console.error('❌ Generation failed:', error);
  } finally {
    await app.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
