## GitHub Issue

Closes GH-6

## Description 📝

This PR implements the Continent and Country modules, including their respective controllers, services, and DTOs. It also introduces an automated seeding process that fetches country data (names, flags, and continents) from the REST Countries API and populates the database.

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

- Created `Continent` and `Country` models in `prisma/schema.prisma`.
- Implemented `ContinentModule`, `ContinentController`, and `ContinentService` for CRUD operations on continents.
- Implemented `CountryModule`, `CountryController`, and `CountryService` for CRUD operations on countries.
- Added a seeding script in `prisma/seed.ts` that integrates with the REST Countries API.
- Updated `AppModule` to include the new modules.
- Updated `UserPropriety` model to link users with their countries.
- Adjusted `AuthService` and `UserService` to handle user-related location data.

## Screenshots 📷 (if applicable)

(No UI changes)
