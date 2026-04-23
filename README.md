# Eigen Library Backend

NestJS + TypeScript + Prisma + PostgreSQL. Implements a Domain-Driven Design layering for a library book borrowing service.

## Stack

- NestJS 10 (Express)
- Prisma 5 + PostgreSQL 16
- Swagger (`@nestjs/swagger`)
- Jest (unit tests)
- Docker Compose (PostgreSQL only)

## Project structure (DDD)

```
backend/
├── prisma/
│   ├── schema.prisma            # Book, Member, Borrowing models
│   └── seed.ts                  # Standalone seed script (npx prisma db seed)
└── src/
    ├── main.ts
    ├── app.module.ts
    ├── prisma/
    │   ├── prisma.module.ts     # Global module exporting PrismaService
    │   └── prisma.service.ts    # Extends PrismaClient, wires lifecycle hooks
    ├── shared/
    │   ├── clock.ts             # Clock abstraction for testable time
    │   ├── exceptions/          # DomainException, BusinessRuleViolation, NotFoundDomainError
    │   └── filters/             # DomainExceptionFilter -> HTTP status mapping
    ├── database/seeds/          # In-app seeder (auto-runs on bootstrap)
    └── modules/
        ├── books/
        │   ├── domain/          # Book entity + repository port
        │   ├── application/     # Use cases + DTOs
        │   ├── infrastructure/  # Prisma repository adapter
        │   └── presentation/    # HTTP controller
        ├── members/             # same 4-layer shape
        └── borrowings/          # same 4-layer shape (owns borrow/return use cases)
```

Each module keeps its own `domain → application → infrastructure → presentation` layering. Cross-module dependencies go through **repository port symbols** (`BOOK_REPOSITORY`, `MEMBER_REPOSITORY`, `BORROWING_REPOSITORY`) — never concrete classes. The domain and application layers never import `@prisma/client`; only the `infrastructure/*.repository.impl.ts` adapters do.

## Getting started

### 1. Start PostgreSQL via Docker

```bash
docker compose up -d
```

This brings up `eigen_library_pg` on host port **5433**.

### 2. Env vars

`.env` is included and matches the Docker defaults:

```env
PORT=3000
DATABASE_URL="postgresql://eigen:eigen@localhost:5433/eigen_library?schema=public"
```

### 3. Install, migrate, run

```bash
npm install
npx prisma migrate dev --name init    # creates the schema in Postgres
npm run start:dev
```

API → `http://localhost:3000`
Swagger UI → `http://localhost:3000/docs`

On first boot the in-app `SeederService` inserts the 5 mock books and 3 mock members from the spec (only if the tables are empty). You can also seed explicitly:

```bash
npx prisma db seed    # runs prisma/seed.ts
# or
npm run seed
```

### 4. Tests

```bash
npm test            # runs all *.spec.ts
npm run test:cov    # with coverage report
```

Unit tests cover:
- Domain entities (`Book`, `Member`, `Borrowing`)
- All four use cases (borrow, return, list available books, list members)

Tests use in-memory mocks for the repository ports and a fake `Clock` — no database is touched.

## Prisma workflow

| Command | Purpose |
| --- | --- |
| `npx prisma generate` | Regenerate the Prisma Client (run after editing `schema.prisma`) |
| `npx prisma migrate dev --name <n>` | Create + apply a migration in dev |
| `npx prisma migrate deploy` | Apply pending migrations in CI/prod |
| `npx prisma studio` | Inspect data in a browser |
| `npx prisma db seed` | Run `prisma/seed.ts` |

## Business rules (enforced)

| Rule | Where |
| --- | --- |
| Member can hold at most 2 active borrowings | `BorrowBookUseCase` |
| A book already borrowed cannot be re-borrowed | `BorrowBookUseCase` |
| Penalized members cannot borrow | `BorrowBookUseCase` + `Member.isPenalized` |
| Returned book must belong to an active borrowing of that member | `ReturnBookUseCase` |
| Returning > 7 days late → penalize member for 3 days | `ReturnBookUseCase` + `Member.penalize(3)` |
| `GET /books` hides currently-borrowed copies from `available` | `GetAvailableBooksUseCase` |
| `GET /members` includes each member's active borrow count | `GetMembersUseCase` |

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/books` | List books with `stock` and `available` |
| GET | `/members` | List members with `borrowedCount` and `penalizedUntil` |
| POST | `/borrowings/borrow` | `{ memberCode, bookCode }` → creates a borrowing |
| POST | `/borrowings/return` | `{ memberCode, bookCode }` → returns a borrowing, may apply penalty |

Domain violations return `422 Unprocessable Entity`; missing resources return `404`.
# test-for-eigen
