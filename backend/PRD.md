# PRD — E-Voting Platform

## Phase 1 — Project Setup ✅
- [x] Express + TypeScript skeleton, global rate limiter, Pino logging

## Phase 2 — Auth & OTP Module
- [x] POST /api/v1/auth/register — create inactive VOTER, trigger REGISTRATION OTP
- [x] POST /api/v1/auth/send-otp — hashed 6-digit code, 5-min expiry, invalidate prior
- [x] POST /api/v1/auth/login — password check, generic 401 on failure, triggers LOGIN OTP
- [x] POST /api/v1/auth/verify-otp — consume OTP; REGISTRATION → activate; LOGIN → issue JWT
- [x] GET /api/v1/auth/me — JWT-protected, returns current user without password hash
- [x] Role-based authorization middleware (`requireRole`, runs after JWT middleware)

## Phase 3 — Registrar Module
- [ ] Registrar endpoints (approve/verify voters)

## Phase 4 — Election Module
- [ ] Election CRUD endpoints

## Phase 5 — Voting Module
- [ ] Ballot casting endpoints

## Phase 6 — Blockchain Module
- [ ] Hyperledger Fabric integration (only `src/blockchain/` references Fabric)

## Phase 7 — Results & Audit
- [ ] Tally/results endpoints
