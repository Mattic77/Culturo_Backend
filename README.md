# Culturo Backend

Backend API for Culturo, a mobile quiz game focused on countries, categories, and competitive play.

Built with NestJS, TypeScript, and Prisma.

## Overview

Culturo backend is designed to power a country quiz experience with:

- User accounts and authentication tokens
- Country and category based quizzes
- Solo game sessions and score tracking
- Online/offline ranking systems
- Player battles and winners history

## Tech Stack

- NestJS 11
- TypeScript 5
- Prisma ORM
- PostgreSQL
- Jest for unit and e2e tests
- ESLint + Prettier

## Project Structure

~~~text
culturo_backend/
  src/                # NestJS application source
  prisma/             # Prisma schema and migrations
  test/               # End to end tests
  docs/               # Project documentation
~~~

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- PostgreSQL database

## Environment Variables

Create a .env file in the project root with the following value:

~~~env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public
PORT=3000
~~~

Notes:

- DATABASE_URL is required by Prisma and Prisma config.
- PORT is optional. Default is 3000.

## Getting Started

1. Install dependencies

~~~bash
npm install
~~~

2. Generate Prisma client

~~~bash
npx prisma generate
~~~

3. Run database migrations

~~~bash
npx prisma migrate dev
~~~

4. Start the development server

~~~bash
npm run start:dev
~~~

The API runs by default on:

~~~text
http://localhost:3000
~~~

## Available Scripts

~~~bash
npm run build        # Build app into dist/
npm run start        # Run app
npm run start:dev    # Run in watch mode
npm run start:debug  # Run in debug + watch mode
npm run start:prod   # Run compiled app

npm run lint         # Lint and auto-fix
npm run format       # Format source and test files

npm run test         # Unit tests
npm run test:watch   # Unit tests in watch mode
npm run test:cov     # Test coverage
npm run test:e2e     # End to end tests
~~~

## Current API Status

At the moment, the bootstrap endpoint returns a simple hello response:

~~~http
GET /
-> Hello World!
~~~

This confirms the backend is running and ready for module expansion.

## Data Model (Prisma)

Core entities already modeled in Prisma include:

- User
- Token
- Country
- Category
- Quiz
- Games
- Battle
- Ranked
- UserRankOnline
- UserRankOffline

This schema provides a strong foundation for your quiz, progression, and ranking features.

## Suggested Next Modules

- Auth module (register, login, refresh token)
- Users module (profile and preferences)
- Countries module (list, search, details)
- Categories module
- Quiz module (question delivery and answer validation)
- Game session module (start, submit, score)
- Battle module (matchmaking and winner calculation)
- Leaderboard module (online and offline rankings)

## Development Notes

- Keep migrations in version control.
- Add request validation with class-validator and DTOs.
- Add global exception filters and logging.
- Enable CORS for your mobile app domain/environment.
- Add Swagger for API documentation when routes are ready.

## License

This project is currently private and unlicensed for public distribution.
