## GitHub Issue

Closes GH-25

## Description 📝

This PR implements a dedicated API endpoint for users to manage their country preferences. This preference is used by the game engine to automatically filter questions without requiring the user to select their country manually for every session.

## Type of Change

- [x] ✨ New feature (non-breaking change that adds functionality)
- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] 📝 Documentation
- [x] ♻️ Code refactor (improved game engine selection logic)

## Changes

- Created `UpdateCountryPreferenceDto` to handle "all" or specific UUID inputs.
- Implemented `updateCountryPreference` in `UserService` to manage the `preferredCountryId` field.
- Added `PATCH /users/preferences/country` to `UserController` with full Swagger documentation.
- Integrated the preference check into `GameService.startSession`.
- Enabled `categoryId` filtering in `GameService.startSession`.

## Screenshots 📸 (N/A)
