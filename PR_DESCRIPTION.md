## GitHub Issue

Closes GH-26

## Description 📝

This PR implements the user-facing workflow for the Challenge system. It allows users to browse and join challenges, and enables the Game Engine to automatically track their progress as they play normal game sessions.

## Type of Change

- [x] ✨ New feature (non-breaking change that adds functionality)
- [ ] 🐛 Bug fix
- [ ] 📝 Documentation
- [x] ♻️ Code refactor (Game Engine integration)

## Changes

- **Challenge Module:**
  - Added `joinChallenge` to allow users to sign up for specific challenges.
  - Added `getMyChallenges` to retrieve a user's active progress.
  - Exposed `POST /challenge/:id/join` and `GET /challenge/me` endpoints.
- **Game Module:**
  - Updated `completeSession` to automatically increment `userScore` for all of the player's active challenges upon game completion.
- **Database:**
  - Added a unique constraint to the `ChallengeUser` join table to prevent double-joining and optimize lookup speed.
- **Tools:**
  - Added `scripts/inject-challenges.ts` for targeted challenge data seeding.

## Screenshots 📸 (N/A)
