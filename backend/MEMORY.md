# MEMORY.md — Cross-Prompt Memory

## Progress Log
- **Prompt 3 — Auth & OTP (SQLite era)**: auth module built and verified; later migrated.
- **Master spec arrived**: full VoteChain backend (PostgreSQL, Mock Aadhaar, Fabric, RBAC, privacy model). Repo rebuilt to match.
- **Postgres migration**: database `votechain` (user `votechain`, password `password`) on local PostgreSQL 18.3 (compose pins 17). `init` migration created; shadow-db permission fixed via `ALTER USER votechain CREATEDB`.
- **All modules implemented**: auth (6 endpoints), registrar (3), elections+candidates (9), voting (4 + results), blockchain explorer (4), audit (3). 23-check live E2E suite: 23/23 PASS.

## Key Decisions
- **OTP hashing**: HMAC-SHA256(code, OTP_PEPPER from env) + `crypto.timingSafeEqual`. 6-digit codes have only 1M combos — bcrypt adds nothing there; the server-side pepper defeats DB-dump attacks.
- **JWT payload**: `{ userId, role, email }` ONLY (master spec). Access-token-only; logout is client-side discard + audit event.
- **Aadhaar = registration-time identity proof only** (registrar searches; checks age 18+, isAlive, duplicates). It is NOT a login factor — Mock Aadhaar is read-only with no credentials. Login = password + OTP.
- **Privacy firewall**: `Ballot` has no userId — only `credentialId`/`candidateId`/`ballotHash`. `AnonymousCredential.issuedTo` → User. ballotHash = SHA-256(electionId|candidateId|credential|pepper).
- **Vote atomicity**: single `prisma.$transaction` — election/eligibility/duplicate checks, credential consumption, ballot creation, chain submission, tx storage. Failure ⇒ full rollback.
- **Publish grants eligibility**: moving an election to PUBLISHED upserts VoterEligibility for every verified profile in its constituency (Phase 1→2 bridge).
- **Results flow**: close → (auditor verify optional but recommended) → declare: chain integrity must pass (`INTEGRITY_OK`) before tally is published and status becomes RESULTS.
- **Simulated Fabric**: hash-chained in-memory ledger (`fabric.client.ts`), batched ~10 tx/block, selected by `SIMULATED_BLOCKCHAIN=true`. Everything outside `src/blockchain/` uses only `fabric.service.ts`.
- **Seeds** (all passwords `Vote@1234`): registrar/admin/auditor@votechain.local (ACTIVE), voter1..10@votechain.local (ACTIVE, random constituencies), 50 MockAadhaar citizens (~4% deceased for negative tests), "Ward Council Election 2026" (DRAFT, Ward-1-North) + 4 candidates. Seed uses a deterministic PRNG.
- **Express 4 + async controllers**: all controllers wrapped in `asyncHandler` — thrown ApiErrors must reach the centralized errorHandler via next(), or the process crashes on unhandled rejection.
- **E2E testing quirk**: the 5/min OTP limiter applies per IP to `/auth/send-otp` + `/auth/verify-otp` — the E2E script sleeps 65s before the auditor login. Eligible voters for the test election are picked dynamically from the DB (seed constituencies are random).

## Rate Limits
- Global: 100 requests / 15 min (all /api routes)
- OTP endpoints: **5 requests / minute** (brute-force protection), on top of global

## Env
`DATABASE_URL`, `PORT=5000`, `JWT_SECRET`, `JWT_EXPIRES_IN=1d`, `OTP_EXPIRY_MINUTES=5`, `OTP_PEPPER`, `CORS_ORIGIN`, `FABRIC_CHANNEL=votechannel`, `FABRIC_CHAINCODE=votechain`, `FABRIC_NETWORK=./blockchain/network`, `SIMULATED_BLOCKCHAIN=true`
