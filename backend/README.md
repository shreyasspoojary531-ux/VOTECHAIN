# VoteChain Backend

Privacy-preserving e-voting platform backend — Node.js 22, Express, TypeScript, PostgreSQL 17, Prisma, JWT + OTP auth, RBAC, and a Hyperledger Fabric abstraction layer (simulated gateway for the MVP).

## Architecture

Modular Monolith:

```
src/
├── blockchain/    # ONLY place that knows about Fabric (simulated ledger for MVP)
├── config/        # env config
├── controllers/   # thin HTTP handlers (asyncHandler-wrapped)
├── crypto/        # bcrypt passwords, HMAC-peppered OTPs, JWT
├── middleware/    # authenticate (JWT), authorize (RBAC), validate (Zod), rate limits, helmet/cors, errors
├── repositories/  # Prisma data access
├── routes/        # /api/v1/{auth,registrar,elections,votes,blockchain,audit}
├── services/      # business logic (auth, registrar, election, candidate, vote, audit)
├── utils/         # logger, prisma client, response envelopes, asyncHandler
└── validators/    # Zod schemas per feature
```

### Privacy model

```
User → VoterProfile → VoterEligibility → AnonymousCredential → Ballot → BlockchainTransaction
       identity side                            anonymous side (no userId on Ballot)
```

`Ballot` stores only `credentialId`, `candidateId`, `ballotHash` — there is no queryable path from a user to a candidate. Vote submission is a single Prisma transaction: validate election → eligibility → duplicate check → consume credential → create ballot → submit chain tx → store tx ref. Any failure rolls everything back.

## Quick start

### Local (requires PostgreSQL 17 running)

```bash
npm install
cp .env.example .env          # then edit secrets
npx prisma migrate dev        # create schema
npm run seed                  # 50 Aadhaar citizens, staff, voters, demo election
npm run dev                   # http://localhost:5000
```

### Docker

```bash
docker compose up --build
```

## Seeded accounts (password `Vote@1234` for all)

| Email | Role |
|---|---|
| registrar@votechain.local | REGISTRAR |
| admin@votechain.local | ADMIN |
| auditor@votechain.local | AUDITOR |
| voter1..10@votechain.local | VOTER |

Auth is two-step: `POST /auth/login` (email + password) → OTP logged to console (demo delivery) → `POST /auth/verify-otp` → JWT. JWT payload contains only `userId`, `role`, `email`.

## API overview (base `/api/v1`)

- **Auth**: register, login, send-otp, verify-otp, logout, me
- **Registrar** (REGISTRAR): aadhaar/search, register-voter (age 18+, alive, no duplicates), voters
- **Elections**: GET list/detail/candidates (any user); POST/PATCH/publish/activate/close/results (ADMIN)
- **Votes** (VOTER): POST /credential, POST / (cast), GET /status, GET /receipt/:txId
- **Blockchain** (AUDITOR/ADMIN): blocks, transactions/:txId, verify/:txId
- **Audit** (AUDITOR): elections, elections/:id, elections/:id/verify

Responses use the envelope `{ success: true, data }` / `{ success: false, error: { code, message } }`.

## Security

Helmet, CORS, rate limiting (global 100/15min; OTP endpoints 5/min), bcrypt password hashing, HMAC-SHA256 OTP hashing with server-side pepper, 5-minute OTP expiry, RBAC via `authorize(...roles)`, Zod validation on every body, centralized error handler, Pino structured logging. Never logged: passwords, JWT secret, OTP codes (except demo delivery), Aadhaar numbers.

## Blockchain layer

`src/blockchain/fabric.service.ts` exposes only `submitVote / getTransaction / getBlock / verifyTransaction`. The MVP ships an in-process hash-chained simulated ledger (`fabric.client.ts`) selected by `SIMULATED_BLOCKCHAIN=true`; a real Fabric SDK gateway drops in behind the same interface without touching business code.

## Verification

`npm run typecheck` — strict TypeScript, clean.

A 23-check end-to-end suite (admin lifecycle, registrar registration with all negative cases, credential issuance, atomic voting, duplicate-vote prevention, RBAC denials, auditor integrity checks, results declaration) was executed against a live server with a fresh seed: **23/23 passed**.
