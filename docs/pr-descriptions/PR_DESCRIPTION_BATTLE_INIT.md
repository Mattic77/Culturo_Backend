## GitHub Issue

Closes GH-12

## Description 📝

This PR initiates the real-time Battle module using WebSockets (Socket.io). It establishes the foundation for online multiplayer battles, including a matchmaking system and real-time event communication.

## Type of Change

- [x] ✨ New feature (non-breaking change that adds functionality)
- [x] 🏗️ Build / CI / configuration change

## Changes

- Created a `scale/REDIS_SCALING.md` guide for future horizontal scaling.
- Installed `@nestjs/websockets`, `@nestjs/platform-socket.io`, and `socket.io`.
- Implemented `BattleModule`, `BattleService`, and `BattleGateway`.
- Added an in-memory `matchmakingQueue` to handle waiting players.
- Implemented the `join_queue` event and automatic matching logic.
- Configured the gateway to create a unique `Battle` record in the database and a dedicated Socket.io room upon matching.

## WebSocket Events 📡

| Event | Direction | Description |
| :--- | :--- | :--- |
| `join_queue` | Client -> Server | Player joins the waiting list |
| `queue_joined` | Server -> Client | Confirmation that player is in queue |
| `match_found` | Server -> Client | Notifies both players that a match is found and provides Room ID |

## Screenshots 📷 (if applicable)

(No UI changes)
