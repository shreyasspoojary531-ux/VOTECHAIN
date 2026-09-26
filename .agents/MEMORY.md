# MEMORY.md — VoteChain Project Memory

This file is the project's living memory. Update it after **every** prompt — this is not optional. Git commit history is only one section of this file, not the whole file.

## Project Context (short)

VoteChain — privacy-preserving digital voting system prototype (fake/demo data only). Implemented complete 11-model Prisma schema, executed initial SQL migration `20260926084701_init`, and created `prisma/seed.ts` to populate 50 `MockAadhaar` citizens (including 5 minors), 1 ADMIN user, 1 REGISTRAR user, and 3 VOTER users.

---

## Progress Log

*(Newest entry on top. One entry per prompt: what was built, key choices made.)*

- Defined all 11 Prisma models in `backend/prisma/schema.prisma` (`MockAadhaar`, `User`, `VoterProfile`, `VoterEligibility`, `OTPCode`, `Election`, `Candidate`, `AnonymousCredential`, `Ballot`, `BlockchainTransaction`, `AuditRecord`) and corresponding enums (`Role`, `OTPPurpose`, `ElectionStatus`, `TransactionStatus`, `AuditEventType`).
- Executed `npx prisma migrate dev --name init` against PostgreSQL database `votechain_db`.
- Implemented `backend/prisma/seed.ts` and executed `npx prisma db seed`, seeding 50 fake `MockAadhaar` citizens (45 adults, 5 minors aged 12–16), 1 ADMIN user, 1 REGISTRAR user, and 3 registered VOTER users.
- Scaffolded Express + TypeScript backend foundation in `backend/` with Docker, Postgres docker-compose integration, Pino HTTP logger, Helmet, CORS, rate limiting, centralized error handler, 404 handler, and `/api/v1/health` route.

---

## Errors & Fixes

- Local PostgreSQL peer authentication failed because unix socket auth was restricted to system user `postgres`. Fixed by executing `CREATE USER votechain_user` and `CREATE DATABASE votechain_db` via `sudo` with user-provided credentials.

---

## Decisions & Assumptions

- **Seeded Demo Credentials**:
  - **ADMIN User**: `admin@votechain.demo` | Password: `DemoPassword123!`
  - **REGISTRAR User**: `registrar@votechain.demo` | Password: `DemoPassword123!`
  - **VOTER Users**: `voter1@votechain.demo`, `voter2@votechain.demo`, `voter3@votechain.demo` | Password: `DemoPassword123!`
- **Prisma Schema Conventions**:
  - Used UUID `String @id @default(uuid())` for primary keys across all models.
  - Set `AnonymousCredential` as the sole link between voter eligibility and an election credential. `Ballot` stores only `credentialHash` (string lookup only, no Prisma relation object back to `AnonymousCredential`, `VoterProfile`, or `User`) to ensure privacy preserving decoupling.
  - Minors seeded with DOBs between 2008 and 2012 (ages 12-16) to provide realistic test cases for the registrar age verification logic (Prompt 4).

---

## Git Commit History

- `a06fa3d` `chore(backend-scaffold): initialize Express TS backend with Docker, Postgres, and centralized error handling`
- `6bb0e7d` `chore(scaffold): create initial project folder structure`