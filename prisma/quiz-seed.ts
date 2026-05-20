import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Difficulty } from '@prisma/client';

async function main() {
  console.log('Start seeding quizzes for Algeria, France, and Italy...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  try {
    const geographyCategory = await prisma.category.findUnique({
      where: { name: 'Geography' },
    });

    if (!geographyCategory) {
      console.error('Geography category not found. Please run the main seed first.');
      return;
    }

    const countries = await prisma.country.findMany({
      where: {
        name: {
          in: ['Algeria', 'France', 'Italy'],
        },
      },
    });

    const algeria = countries.find((c) => c.name === 'Algeria');
    const france = countries.find((c) => c.name === 'France');
    const italy = countries.find((c) => c.name === 'Italy');

    if (!algeria || !france || !italy) {
      console.error('One or more countries (Algeria, France, Italy) not found in the database.');
      if (!algeria) console.log('- Algeria missing');
      if (!france) console.log('- France missing');
      if (!italy) console.log('- Italy missing');
      return;
    }

    const quizzes = [
      // Algeria
      {
        categoryId: geographyCategory.id,
        countryId: algeria.id,
        difficulty: Difficulty.Easy,
        question: 'What is the capital of Algeria?',
        answer: 'Algiers',
        suggestedAnswer: { options: ['Oran', 'Algiers', 'Constantine', 'Annaba'] },
      },
      {
        categoryId: geographyCategory.id,
        countryId: algeria.id,
        difficulty: Difficulty.Medium,
        question: 'Algeria is the largest country in which continent?',
        answer: 'Africa',
        suggestedAnswer: { options: ['Asia', 'Europe', 'Africa', 'South America'] },
      },
      {
        categoryId: geographyCategory.id,
        countryId: algeria.id,
        difficulty: Difficulty.Medium,
        question: 'What is the official language of Algeria?',
        answer: 'Arabic',
        suggestedAnswer: { options: ['French', 'Arabic', 'Berber', 'English'] },
      },
      // France
      {
        categoryId: geographyCategory.id,
        countryId: france.id,
        difficulty: Difficulty.Easy,
        question: 'What is the capital of France?',
        answer: 'Paris',
        suggestedAnswer: { options: ['Lyon', 'Marseille', 'Paris', 'Bordeaux'] },
      },
      {
        categoryId: geographyCategory.id,
        countryId: france.id,
        difficulty: Difficulty.Easy,
        question: 'Which famous tower is located in Paris?',
        answer: 'Eiffel Tower',
        suggestedAnswer: { options: ['Big Ben', 'Leaning Tower of Pisa', 'Eiffel Tower', 'Empire State Building'] },
      },
      {
        categoryId: geographyCategory.id,
        countryId: france.id,
        difficulty: Difficulty.Medium,
        question: 'What is the longest river in France?',
        answer: 'Loire',
        suggestedAnswer: { options: ['Seine', 'Rhône', 'Garonne', 'Loire'] },
      },
      // Italy
      {
        categoryId: geographyCategory.id,
        countryId: italy.id,
        difficulty: Difficulty.Easy,
        question: 'What is the capital of Italy?',
        answer: 'Rome',
        suggestedAnswer: { options: ['Milan', 'Rome', 'Florence', 'Naples'] },
      },
      {
        categoryId: geographyCategory.id,
        countryId: italy.id,
        difficulty: Difficulty.Medium,
        question: 'Which Italian city is famous for its canals?',
        answer: 'Venice',
        suggestedAnswer: { options: ['Venice', 'Verona', 'Turin', 'Genoa'] },
      },
      {
        categoryId: geographyCategory.id,
        countryId: italy.id,
        difficulty: Difficulty.Hard,
        question: 'What is the name of the volcano that destroyed Pompeii in 79 AD?',
        answer: 'Mount Vesuvius',
        suggestedAnswer: { options: ['Mount Etna', 'Mount Stromboli', 'Mount Vesuvius', 'Mount Pelée'] },
      },
    ];

    for (const quiz of quizzes) {
        const existing = await prisma.quiz.findFirst({
            where: { 
                question: quiz.question,
                countryId: quiz.countryId
            }
        });
        if (!existing) {
            await prisma.quiz.create({ data: quiz });
            console.log(`Created quiz: ${quiz.question}`);
        } else {
            console.log(`Quiz already exists: ${quiz.question}`);
        }
    }

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

