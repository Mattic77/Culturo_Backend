import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Usertype } from '@prisma/client';
import * as bcrypt from 'bcrypt';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  console.log('Start seeding...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  try {
    // --- Seed Categories ---
    const categories = [
      { name: 'History', icon: 'https://res.cloudinary.com/demo/image/upload/v1631234567/history_icon.png' },
      { name: 'Science', icon: 'https://res.cloudinary.com/demo/image/upload/v1631234567/science_icon.png' },
      { name: 'Geography', icon: 'https://res.cloudinary.com/demo/image/upload/v1631234567/geography_icon.png' },
      { name: 'Sports', icon: 'https://res.cloudinary.com/demo/image/upload/v1631234567/sports_icon.png' },
      { name: 'Art', icon: 'https://res.cloudinary.com/demo/image/upload/v1631234567/art_icon.png' },
    ];

    for (const category of categories) {
      await prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: category,
      });
    }
    console.log('Categories seeded.');

    // --- Seed Users ---
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        email: 'admin@culturo.com',
        username: 'admin_user',
        password: hashedPassword,
        userType: Usertype.admin,
        isActivate: true,
      },
      {
        email: 'user@culturo.com',
        username: 'normal_user',
        password: hashedPassword,
        userType: Usertype.user,
        isActivate: true,
      },
    ];

    for (const user of users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: user,
      });
    }
    console.log('Users seeded.');

    console.log('Seeding finished.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await app.close();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
