## GitHub Issue

Closes GH-14

## Description 📝

This PR completes the core gameplay loop for the real-time Battle module. It transitions the module from simple matchmaking to a fully synchronized, round-based multiplayer game.

## Type of Change

- [x] ✨ New feature (non-breaking change that adds functionality)
- [x] ♻️ Code refactor (no functional changes)

## Changes

- **Synchronized Gameplay:** Players receive the same questions at the exact same time.
- **Scoring System:** Points are calculated based on speed and correctness (Max 150 pts per round).
- **Round Management:** The server manages round transitions, ensuring both players have answered or the round timed out.
- **XP Rewards:** 
    - 🏆 **Winner:** +100 XP
    - 🥈 **Loser:** +20 XP
    - 🤝 **Draw:** +50 XP
- **Database Integration:** Battles are finalized in the DB with winner information and end timestamps.
- **Validation:** Updated `scripts/test-battle.ts` to simulate a complete 15-question battle from start to finish.

## WebSocket Events Updated 📡

| Event | Direction | Description |
| :--- | :--- | :--- |
| `battle_started` | Server -> Client | Notifies players that the battle is beginning |
| `new_question` | Server -> Client | Sends the current question to both players |
| `submit_answer` | Client -> Server | Player submits their answer |
| `answer_result` | Server -> Client | Individual feedback for the player |
| `round_ended` | Server -> Client | Broadcasts scores and the correct answer for the round |
| `battle_finished` | Server -> Client | Final results and winner announcement |

## Screenshots 📷 (if applicable)

(No UI changes)
