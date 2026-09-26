# PRD — VoteChain E-Voting Platform

Master spec: secure distributed voting system (Modular Monolith, PostgreSQL, Fabric).

## Phase 1 — Project Setup ✅
- [x] Express + TypeScript skeleton, PostgreSQL 17 + Prisma, Pino, Helmet, CORS, rate limiting, centralized errors, response envelopes

## Phase 2 — Auth & OTP Module ✅
- [x] POST /api/v1/auth/register
- [x] POST /api/v1/auth/send-otp
- [x] POST /api/v1/auth/login (password → LOGIN OTP → JWT)
- [x] POST /api/v1/auth/verify-otp (REGISTRATION → activate; LOGIN → JWT)
- [x] POST /api/v1/auth/logout
- [x] GET /api/v1/auth/me
- [x] Role-based authorization middleware (authorize(...roles) + authenticate())

## Phase 3 — Registrar Module ✅
- [x] GET /registrar/aadhaar/search (read-only Mock Aadhaar)
- [x] POST /registrar/register-voter (age 18+, alive, duplicate checks → User + VoterProfile)
- [x] GET /registrar/voters

## Phase 4 — Election & Candidates Module ✅
- [x] GET/POST/PATCH /elections, publish/activate/close lifecycle (ADMIN)
- [x] Candidates CRUD with DRAFT/PUBLISHED-only mutation rules
- [x] Publish auto-grants eligibility to verified profiles in the constituency

## Phase 5 — Voting Module ✅
- [x] POST /votes/credential (eligibility + one live credential per election)
- [x] POST /votes (atomic: election → eligibility → duplicate → credential → ballot → chain tx)
- [x] GET /votes/status, GET /votes/receipt/:txId
- [x] POST /elections/:id/results (close → chain integrity check → tally)

## Phase 6 — Blockchain Module ✅ (simulated)
- [x] fabric.service exposing only submitVote/getTransaction/getBlock/verifyTransaction
- [x] Hash-chained simulated ledger; real Fabric SDK swap-in point defined
- [x] Explorer endpoints + per-transaction verification

## Phase 7 — Audit ✅
- [x] GET /audit/elections, /audit/elections/:id, /audit/elections/:id/verify
- [x] AuditRecord written by every module through audit.service.logEvent

## Deferred
- [ ] Real Hyperledger Fabric network (chaincode + gateway SDK)
- [ ] Automated test suite (Jest/Vitest) — currently verified via scripted E2E (23 checks)
