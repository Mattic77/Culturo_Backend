## GitHub Issue

Closes GH-20

## Description 📝

This PR introduces the social layer to Culturo by implementing a comprehensive Friend System and a real-time Battle Invitation mechanism. It allows users to build a network and challenge specific friends directly.

## Type of Change

- [x] ✨ New feature (non-breaking change that adds functionality)
- [x] 🗄️ Database schema change

## Changes

### 👥 Friend System
- **Models:** Added `Friendship` and `BattleInvite` to `prisma/schema.prisma`.
- **Friend Requests:** Endpoints to send, accept, and view pending requests.
- **Friend List:** Securely retrieve all accepted friends with their usernames and profile colors.

### ⚔️ Real-time Battle Invites
- **Online Tracking:** `BattleGateway` now tracks online users mapping their `userId` to `socketId`.
- **Direct Invites:** Users can now emit a `send_invite` event to an online friend.
- **Instant Notification:** The receiver gets an `invite_received` event immediately via WebSockets.
- **Security:** All real-time social actions are protected by the `WsAuthGuard`.

## WebSocket Events 📡

| Event | Direction | Description |
| :--- | :--- | :--- |
| `send_invite` | Client -> Server | Send a battle challenge to a specific friend |
| `invite_received` | Server -> Client | Notifies a user they have been challenged |

## Screenshots 📷 (if applicable)

(No UI changes)

---

**Note:** Ensure you run the provided SQL script in the Supabase Editor to update the database schema before testing.
