## GitHub Issue

Closes GH-7

## Description 📝

This PR introduces the user progression system, including levels and rankings. It adds the necessary models to the database schema and ensures that every new user starts with a level. It also enhances the user profile retrieval to include their current level and ranking information.

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

- Added `UserLevel`, `Ranked`, `UserRankOnline`, and `UserRankOffline` models to `prisma/schema.prisma`.
- Updated `AuthService` to automatically create a `UserLevel` record when a new user registers.
- Updated `UserService` to include `userLevel` and `rankOnline` (with rank details) when fetching a user by ID.
- Updated `.gitignore` to exclude the `skills/` directory.

## Screenshots 📷 (if applicable)

(No UI changes)
