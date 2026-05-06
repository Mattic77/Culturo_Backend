# Culturo Backend Project Plan

## Overview
**Project Name:** Culturo
**Platform:** NestJS (Backend for Mobile Application)
**Database:** PostgreSQL with Prisma ORM
**Scope:** Global cultural quiz application featuring single-player challenges and real-time 1v1 battles.

## Development Approach: Module-by-Module (Vertical Slices)
We will develop the backend feature by feature, ensuring each module is fully functional, tested, and integrated before moving to the next.

### Phase 1: Core Architecture & Security Foundation
*   **NestJS Initialization:** Setup the base project structure.
*   **Prisma Setup:** Configure database connection and generate client.
*   **Global Security Measures:**
    *   **Helmet:** Configure HTTP security headers.
    *   **CORS:** Restrict access to authorized mobile origins.
    *   **Rate Limiting:** Implement `@nestjs/throttler` to protect against brute-force attacks (especially on auth routes).
    *   **Validation:** Global validation pipes using `class-validator` and `class-transformer` (stripping unknown properties).
*   **Error Handling:** Global exception filters for consistent API responses.

### Phase 2: Authentication & User Setup Module
*   **Auth Strategy:** JWT (Stateless) with short-lived Access Tokens and secure Refresh Tokens.
*   **Password Security:** Hashing using `bcrypt` or `argon2`.
*   **Guards:**
    *   `JwtAuthGuard`: To protect private routes.
    *   `RolesGuard` (optional but recommended): For administrative actions if needed later.
*   **Features:**
    *   User Registration (Sign Up).
    *   Login (Sign In).
    *   Email Verification / OTP generation and validation.
    *   Password Reset flow.
    *   Setup user properties (`UserPropriety`) like initial level and country selection.

### Phase 3: Content Management Module (Read-Only API)
*   **Asset Hosting:** External URLs (e.g., S3 or Cloudinary) for Country flags and Category icons.
*   **Features:**
    *   Fetch all available Countries.
    *   Fetch all Categories.
    *   Endpoints to fetch quizzes based on Category and Country.

### Phase 4: Gameplay Module (Single Player)
*   **Features:**
    *   Daily Challenge logic.
    *   Record game sessions (`Games` model).
    *   Calculate and update scores/XP in `UserCategory`.
    *   Update `UserStat` (Streaks, total games played).

### Phase 5: Multiplayer Battle Module (Real-time)
*   **Tech Stack:** WebSockets using Socket.io via NestJS Gateways.
*   **Security:** Apply JWT verification to WebSocket connections (Custom WsGuard).
*   **Features:**
    *   Matchmaking lobby (finding opponents based on rank/level).
    *   Real-time state synchronization (answering questions, timers).
    *   End of battle processing (recording winner in `Battle` model, updating ELO/scores).

### Phase 6: Ranking & Leaderboard Module
*   **Features:**
    *   Aggregate user scores.
    *   Update `UserRankOnline` and `UserRankOffline` based on game and battle outcomes.
    *   Endpoints to retrieve global, regional, and friend leaderboards.

## Security Checklist
- [ ] Passwords hashed before saving.
- [ ] JWT secrets secured in `.env`.
- [ ] `JwtAuthGuard` applied to all protected routes.
- [ ] Rate limiters configured for public endpoints (Auth/OTP).
- [ ] Input validation pipes enabled globally with `whitelist: true`.
- [ ] Secure WebSocket connections.
- [ ] Prevent Prisma injection by avoiding raw queries where possible and sanitizing inputs.
