# 🚀 Scaling with Redis

This document explains the transition from In-Memory state management to Redis for the Battle Module.

## 🔴 Current Implementation: In-Memory
Currently, the `BattleModule` uses local server memory (RAM) to manage:
- **Matchmaking Queue:** The list of players waiting for an opponent.
- **Active Game States:** Round timers, scores, and current question indices.
- **Socket.io Rooms:** Handled locally by the server instance.

### ⚠️ Limitations of In-Memory
1. **Vertical Scaling Only:** If we run multiple instances of the backend (Load Balancing), players on different servers cannot find each other.
2. **Volatility:** If the server restarts, all active battles and queues are lost.
3. **Synchronization:** Maintaining state across parallel processes is impossible without a shared store.

## 🟢 Future Implementation: Redis
When the application reaches a high volume of concurrent users or requires multiple server instances, we must migrate to **Redis**.

### 🛠️ Why Redis?
1. **Shared State (Global Queue):** All server instances connect to the same Redis instance. A player on Server A can be matched with a player on Server B.
2. **Persistence:** Redis can be configured to persist data, meaning active games could potentially survive a server crash.
3. **Speed:** Redis operations are performed in RAM, ensuring the low latency required for real-time gaming.
4. **Pub/Sub (Redis Adapter):** Using `@socket.io/redis-adapter`, messages sent from Server A can be broadcasted to clients connected to Server B.

### 🗺️ Migration Roadmap
1. **Install Dependencies:**
   ```bash
   npm install ioredis @socket.io/redis-adapter
   ```
2. **Setup Redis Service:** Create a wrapper for Redis commands (LPUHS, LPOP for queues; SET/GET for game states).
3. **Replace Memory Stores:** Swap the local arrays/maps in `BattleService` with Redis calls.
4. **Configure Gateway Adapter:** Update `main.ts` to use the Redis Adapter for Socket.io.

---

**Note:** This documentation serves as a guide for the architectural transition when horizontal scaling becomes a requirement.
