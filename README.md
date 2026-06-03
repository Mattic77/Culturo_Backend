<p align="center">
  <img src="CulturoLogo.png" width="200" alt="Culturo Logo" />
</p>

# 🌍 Culturo Backend

> **Culturo** is a competitive mobile quiz game designed to explore world cultures, countries, and categories through engaging gameplay and social battles.

Built with **NestJS**, **TypeScript**, and **Prisma**, this backend provides a robust, scalable API for authentication, game logic, progression tracking, and real-time interactions.

---

## 🚀 Features

- 🔐 **Authentication & Security**: Secure JWT-based auth, OTP validation, and role-based access control (Admin/User).
- 🎮 **Game Engine**: Solo game sessions with difficulty levels (Easy, Medium, Hard) and real-time answer validation.
- ⚔️ **Battle System**: 1v1 competitive matches with real-time WebSocket communication.
- 🏆 **Progression & Rankings**: XP system, level unlocking, and global Online/Offline leaderboards.
- 📅 **Challenges**: Automated daily/monthly challenges with cron-based lifecycle management.
- 🗺️ **World Content**: Structured data for continents, countries, and cultural categories.
- 🖼️ **Cloud Integration**: Image management via Cloudinary.

---

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (v11+)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Real-time**: [Socket.io](https://socket.io/)
- **Authentication**: JWT & Passport
- **Storage**: [Cloudinary](https://cloudinary.com/)
- **Documentation**: [Swagger / OpenAPI](https://swagger.io/)

---

## 🏗️ Architecture

The project follows a modular architecture for high maintainability:

- **Modules**: Domain-driven separation (Auth, User, Battle, Challenge, etc.).
- **Controllers**: Handling HTTP requests and WebSocket events.
- **Services**: Encapsulating core business logic.
- **Tasks**: Automated cron jobs for background operations.

Visual diagrams are available in the [docs/](docs/) folder:
- [Database Schema (ERD)](docs/DIAGRAM_DATABASE.md)
- [Code Architecture](docs/DIAGRAM_ARCHITECTURE.md)

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- Redis (Optional, for scaling)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/culturo-backend.git
   cd culturo-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/culturo"
   JWT_SECRET="your_secret"
   CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
   ```

4. Database migration & generation:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Start the server:
   ```bash
   npm run start:dev
   ```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📝 API Documentation

Once the server is running, you can access the interactive Swagger documentation at:
`http://localhost:3000/api`

---

## 📜 License

This project is [UNLICENSED](LICENSE).
