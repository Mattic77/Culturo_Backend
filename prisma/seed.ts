import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  Usertype,
  Continent,
  Difficulty,
  Theme,
  ChallengeStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

type RestCountry = {
  name: { common: string };
  flags: { png?: string; svg?: string };
  continents: string[];
};

async function main() {
  console.log('Start seeding...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  try {
    // --- Seed Categories ---
    const categories = [
      {
        name: 'History',
        icon: 'https://res.cloudinary.com/demo/image/upload/v1631234567/history_icon.png',
        subtitle: 'Past moments',
        description: 'Past events',
        theme: Theme.ROSE,
      },
      {
        name: 'Science',
        icon: 'https://res.cloudinary.com/demo/image/upload/v1631234567/science_icon.png',
        subtitle: 'Curious minds',
        description: 'Science facts',
        theme: Theme.TEAL,
      },
      {
        name: 'Geography',
        icon: 'https://res.cloudinary.com/demo/image/upload/v1631234567/geography_icon.png',
        subtitle: 'World places',
        description: 'World locations',
        theme: Theme.FOREST,
      },
      {
        name: 'Sports',
        icon: 'https://res.cloudinary.com/demo/image/upload/v1631234567/sports_icon.png',
        subtitle: 'Game spirit',
        description: 'Sports facts',
        theme: Theme.BLUE,
      },
      {
        name: 'Art',
        icon: 'https://res.cloudinary.com/demo/image/upload/v1631234567/art_icon.png',
        subtitle: 'Creative flow',
        description: 'Creative expression',
        theme: Theme.VIOLET,
      },
    ];

    for (const category of categories) {
      await prisma.category.upsert({
        where: { name: category.name },
        update: {
          icon: category.icon,
          subtitle: category.subtitle,
          description: category.description,
          theme: category.theme,
        },
        create: category,
      });
    }
    console.log('Categories seeded.');

    // --- Seed Continents ---
    const continentNames = ['Africa', 'Europe', 'Asia', 'Americas', 'Oceania'];

    const seededContinents: Continent[] = [];
    for (const name of continentNames) {
      const c = await prisma.continent.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      seededContinents.push(c);
    }
    console.log('Continents seeded.');

    // --- Seed Countries from REST Countries API ---
    console.log('Fetching countries from REST Countries API...');
    let apiCountries: RestCountry[] = [];
    try {
      const response = await fetch(
        'https://restcountries.com/v3.1/all?fields=name,flags,continents',
      );
      if (!response.ok) {
        const text = await response.text();
        console.error(
          `API Response not OK: ${response.status} ${response.statusText}`,
          text,
        );
        throw new Error(
          `Failed to fetch countries from API: ${response.status}`,
        );
      }
      apiCountries = (await response.json()) as RestCountry[];
    } catch (fetchError) {
      console.error(
        'Fetch operation failed:',
        fetchError instanceof Error ? fetchError.message : fetchError,
      );
      throw fetchError;
    }

    const africaId = seededContinents.find((c) => c.name === 'Africa')?.id;
    const europeId = seededContinents.find((c) => c.name === 'Europe')?.id;
    const asiaId = seededContinents.find((c) => c.name === 'Asia')?.id;
    const americasId = seededContinents.find((c) => c.name === 'Americas')?.id;
    const oceaniaId = seededContinents.find((c) => c.name === 'Oceania')?.id;

    const getContinentId = (continents: string[]) => {
      const main = continents[0];
      if (main === 'Africa') return africaId;
      if (main === 'Europe') return europeId;
      if (main === 'Asia') return asiaId;
      if (main === 'North America' || main === 'South America')
        return americasId;
      if (main === 'Oceania' || main === 'Antarctic') return oceaniaId;
      return null;
    };

    console.log(`Processing ${apiCountries.length} countries...`);
    for (const country of apiCountries) {
      const name = country.name.common;
      const flagIcon = country.flags.png || country.flags.svg;
      const continentId = getContinentId(country.continents);

      if (continentId) {
        await prisma.country.upsert({
          where: { name },
          update: { flagIcon, continentId },
          create: { name, flagIcon, continentId },
        });
      }
    }
    console.log('All countries seeded from API.');

    // --- Seed Quizzes ---
    console.log('Seeding quizzes...');
    const historyCategory = await prisma.category.findUnique({
      where: { name: 'History' },
    });
    const geographyCategory = await prisma.category.findUnique({
      where: { name: 'Geography' },
    });
    const morocco = await prisma.country.findUnique({
      where: { name: 'Morocco' },
    });
    const france = await prisma.country.findUnique({
      where: { name: 'France' },
    });

    if (historyCategory && geographyCategory && morocco && france) {
      const quizzes = [
        {
          categoryId: historyCategory.id,
          countryId: morocco.id,
          difficulty: Difficulty.Easy,
          question: 'In what year did Morocco gain independence?',
          answer: '1956',
          suggestedAnswer: { options: ['1950', '1956', '1960', '1965'] },
        },
        {
          categoryId: geographyCategory.id,
          countryId: france.id,
          difficulty: Difficulty.Medium,
          question: 'What is the largest city in France?',
          answer: 'Paris',
          suggestedAnswer: {
            options: ['Lyon', 'Marseille', 'Paris', 'Bordeaux'],
          },
        },
        {
          categoryId: geographyCategory.id,
          difficulty: Difficulty.Hard,
          question: 'Which is the largest continent by area?',
          answer: 'Asia',
          suggestedAnswer: {
            options: ['Africa', 'Asia', 'Europe', 'North America'],
          },
        },
      ];

      for (const quiz of quizzes) {
        await prisma.quiz.create({
          data: quiz,
        });
      }
    }
    console.log('Quizzes seeded.');

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

    // --- Seed Challenges ---
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

    for (const challenge of challenges) {
      await prisma.challenge.create({
        data: challenge,
      });
    }
    console.log('Challenges seeded.');

    console.log('Seeding finished.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await app.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
