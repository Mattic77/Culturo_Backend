## GitHub Issue

Closes GH-24

## Description 📝

This PR completes the Swagger/OpenAPI documentation for all existing API endpoints. It ensures that every controller has proper tags, operation summaries, and response descriptions, and that all request DTOs are correctly documented with `@ApiProperty`.

## Type of Change

- [ ] ✨ New feature
- [ ] 🐛 Bug fix
- [x] 📝 Documentation
- [x] 🧪 Tests (documentation testing)

## Changes

- Added Swagger decorators to `AppController`, `ChallengeController`, `GameController`, `FriendController`, and `ProgressionController`.
- Created formal DTOs (`CreateRankDto`, `UpdateRankDto`) for the Progression module to replace inline types.
- Fixed a missing `AuthGuard` on the `updateEmail` endpoint in `UserController` to ensure security consistency.
- Standardized use of `@ApiBearerAuth()` across all protected routes.
