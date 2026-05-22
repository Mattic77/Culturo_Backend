# 🧪 Testing in NestJS: A Comprehensive Guide

NestJS provides a robust testing infrastructure out of the box, primarily based on **Jest**.

## 1. Types of Tests

### 🧪 Unit Tests
- **Purpose:** Test a single class (Service, Controller) in isolation.
- **Key Concept:** Mocks. You "mock" (fake) the dependencies (like Prisma) so you only test the logic of that specific file.
- **Location:** `src/**/*.spec.ts`
- **Run:** `npm run test`

### 🏗️ E2E (End-to-End) Tests
- **Purpose:** Test the whole application flow (Request -> Controller -> Service -> DB -> Response).
- **Key Concept:** Real (or test) database. It simulates a real user calling your API.
- **Location:** `test/app.e2e-spec.ts`
- **Run:** `npm run test:e2e`

### 📡 WebSocket Testing (Special for Battle)
- **Purpose:** Test real-time events (`join_queue`, `match_found`).
- **Key Concept:** Socket.io client. You create a fake client that connects to your server and listens for events.

---

## 2. Basic Example: Service Testing

If you want to test `ProgressionService`, you create a file `progression.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ProgressionService } from './progression.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProgressionService', () => {
  let service: ProgressionService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressionService,
        {
          provide: PrismaService,
          useValue: {
            userLevel: { findUnique: jest.fn() }, // Mocking Prisma
          },
        },
      ],
    }).compile();

    service = module.get<ProgressionService>(ProgressionService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should calculate progress percentage correctly', async () => {
    // Fake the database response
    jest.spyOn(prisma.userLevel, 'findUnique').mockResolvedValue({
      xp: 50,
      level: 1,
    } as any);

    const result = await service.getUserLevel('user-123');
    expect(result.progressPercentage).toBe(33); // 50 / (1 * 100 * 1.5) = 50/150 = 33%
  });
});
```

---

## 3. Advanced: E2E Testing with a Real DB

In `test/app.e2e-spec.ts`, you use `supertest` to call your endpoints:

```typescript
import * as request from 'supertest';

it('/users/getme (GET) - Fail if no token', () => {
  return request(app.getHttpServer())
    .get('/users/getme')
    .expect(401);
});

it('/users/getme (GET) - Success with token', async () => {
  const token = 'your-test-jwt';
  return request(app.getHttpServer())
    .get('/users/getme')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
});
```

---

## 4. Useful Commands

- `npm run test`: Run all unit tests.
- `npm run test:watch`: Run tests and wait for changes (Great for development!).
- `npm run test:cov`: Generate a **Coverage Report** (Shows you which lines of code are NOT tested yet).
- `npm run test:debug`: For debugging tests with breakpoints.

---

## 🏁 Best Practices
1. **Test logic, not frameworks:** Focus on your custom logic in Services.
2. **Keep tests isolated:** One test should not depend on another.
3. **Use a Test DB:** Never run E2E tests on your production database!
