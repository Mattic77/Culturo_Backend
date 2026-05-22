## GitHub Issue

Closes GH-21

## Description 📝

This PR implements API Rate Limiting across the entire backend using the `@nestjs/throttler` package. It provides a global safety layer and strict protection for sensitive endpoints to prevent brute-force attacks and spam.

## Type of Change

- [x] ✨ New feature (non-breaking change that adds functionality)
- [x] 🔒 Security improvement

## Changes

- **Global Throttling:** Configured a global limit of **100 requests per minute** in `AppModule`.
- **Auth Protection:** Implemented strict limits for authentication routes:
    - `POST /auth/signin`: 10 attempts per minute.
    - `POST /auth/signup`: 5 attempts per minute.
    - `POST /auth/signup-otp`: 3 attempts per minute (Protects email/OTP costs).
- **Spam Protection:** Limited `POST /friends/request/:id` to 10 per minute to prevent harassment.
- **Middleware Integration:** Integrated `ThrottlerGuard` as a global APP_GUARD.

## Headers 📡

The API will now return the following standard rate-limit headers:
- `X-RateLimit-Limit`: Maximum requests allowed in the window.
- `X-RateLimit-Remaining`: Remaining requests in the current window.
- `X-RateLimit-Reset`: Time (in seconds) until the window resets.

## Screenshots 📷 (if applicable)

(No UI changes)
