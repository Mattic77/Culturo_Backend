## GitHub Issue

Closes GH-8

## Description 📝

This PR implements the Quiz module, which manages the core trivia content of the application. It includes models for quizzes with varying difficulty levels, linked to categories and countries. It also provides a robust seeding mechanism for initial quiz data.

## Type of Change

Please check the relevant option(s):

- [x] ✨ New feature (non-breaking change that adds functionality)
- [ ] 🐞 Bug fix (non-breaking change that fixes an issue)
- [ ] 💥 Breaking change (fix or feature that changes existing behavior)
- [ ] ♻️ Code refactor (no functional changes)
- [ ] 🏗️ Build / CI / configuration change
- [ ] 📝 Documentation
- [ ] 🧹 Chore / maintenance

## Changes

This Pull Request includes the following changes:

- Added `Quiz` model and `Difficulty` enum to `prisma/schema.prisma`.
- Created `QuizModule`, `QuizController`, and `QuizService` for managing quiz data.
- Added support for filtering quizzes by category, country, and difficulty.
- Implemented quiz seeding in `prisma/seed.ts` and created a sample `prisma/quiz-seed.ts`.
- Established relationships between `Quiz`, `Category`, and `Country` models.

## Screenshots 📷 (if applicable)

(No UI changes)
