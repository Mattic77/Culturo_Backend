## GitHub Issue

Closes GH-11

## Description 📝

This PR introduces a dedicated `ProgressionModule` to handle user levels, XP tracking, and ranking information. By separating these concerns from the core `UserModule`, the API becomes more scalable and provides more detailed information for the frontend development.

## Type of Change

- [x] ✨ New feature (non-breaking change that adds functionality)
- [ ] ♻️ Code refactor (no functional changes)

## Changes

- Created `ProgressionModule`, `ProgressionService`, and `ProgressionController`.
- Implemented `GET /progression/level`: Returns current level, XP, and calculated progress toward the next level.
- Implemented `GET /progression/ranks/me`: Returns the user's current online and offline ranks with full details.
- Implemented `GET /progression/ranks`: Returns a list of all available ranks and their score requirements.
- Integrated Swagger documentation for all new endpoints.

## API Endpoints List 🚀

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/progression/level` | Get current user level, XP, and % progress | ✅ Yes |
| `GET` | `/progression/ranks/me` | Get current user's Online & Offline ranks | ✅ Yes |
| `GET` | `/progression/ranks` | Get list of all possible ranks in the system | ❌ No |

## Screenshots 📷 (if applicable)

(No UI changes)
