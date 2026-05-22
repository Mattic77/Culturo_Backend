## GitHub Issue

Closes GH-9

## Description 📝

This PR implements the Game module, which handles the interactive gameplay sessions. It introduces models for tracking game sessions, individual questions within those sessions, and overall game results. The module supports starting new games, submitting answers, and completing sessions with score tracking.

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

- Added `GameSession`, `GameSessionQuestion`, and `Games` models to `prisma/schema.prisma`.
- Created `GameModule`, `GameController`, and `GameService` for managing gameplay.
- Implemented logic for starting a game session, which generates a set of questions based on category and difficulty.
- Added endpoints for submitting answers and updating the session score.
- Implemented session completion and persistence of final game results.
- Integrated difficulty levels (Easy, Medium, Hard) into the gameplay logic.

## Screenshots 📷 (if applicable)

(No UI changes)
