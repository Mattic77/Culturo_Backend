## GitHub Issue

Closes GH-19

## Description 📝

This PR secures the real-time Battle module by implementing a dedicated `WsAuthGuard`. It ensures that only authenticated users with valid JWT tokens can connect to and interact with the battle system.

## Type of Change

- [x] ✨ New feature (non-breaking change that adds functionality)
- [x] 🔒 Security improvement

## Changes

- **New `WsAuthGuard`:** Grabs the token from the connection handshake (Headers or Auth payload) and validates it using `JwtService` or the fallback Database token store.
- **Gateway Protection:** Applied `@UseGuards(WsAuthGuard)` to critical events:
    - `join_queue`: Users no longer provide their `userId` in the message body. It is securely extracted from the validated token.
    - `submit_answer`: Validates that the player submitting the answer is indeed the authenticated user assigned to that battle.
- **Secure Context:** User identity is now stored in `client.data.user`, providing a safe server-side context for all real-time events.
- **Safe Disconnect:** On disconnection, the server uses the secure context to remove the player from the queue, preventing potential impersonation or orphaned entries.

## WebSocket Handshake Update 📡

The frontend must now provide the JWT token when connecting to the namespace:

```javascript
// Example using socket.io-client
const socket = io('http://localhost:3000/battle', {
  auth: {
    token: 'Bearer YOUR_JWT_TOKEN'
  }
});
```

## Screenshots 📷 (if applicable)

(No UI changes)
