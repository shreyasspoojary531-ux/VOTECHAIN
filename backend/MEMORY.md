# MEMORY.md — Cross-Prompt Memory

## Progress Log
- **Prompt 1–2 (reconstructed)**: repo arrived as an empty skeleton, so project bootstrap was rebuilt alongside the auth module: package.json/tsconfig, Express app + server, Pino logger, global rate limiter, Prisma (SQLite) with User/OTPCode/AuditRecord, seed with active admin/registrar.
- **Prompt 3 — Auth & OTP module**: full register → OTP → activation → login → OTP → JWT → /me flow implemented and verified end-to-end against the seeded admin/registrar and a fresh test voter (voter4@test.local). Negative cases verified: generic 401 on bad credentials, 401 without token, consumed-OTP reuse rejected, Zod validation errors on malformed bodies.

## Key Decisions
- **OTP hashing**: HMAC-SHA256(code, OTP_PEPPER from env). Chosen over bcrypt because 6-digit codes have only 1M combinations — bcrypt's cost factor adds nothing meaningful there, while the server-side pepper (never in the DB) makes DB-dump attacks infeasible and hashing stays instant. Compare uses `crypto.timingSafeEqual`.
- **Seeded credentials** (password for both: `Admin@123`):
  - admin@evote.local — role ADMIN, isActive: true
  - registrar@evote.local — role REGISTRAR, isActive: true
- **Schema field names**: `User { id, email, passwordHash, role, isActive }`, `OTPCode { userId, purpose, codeHash, expiresAt, consumedAt }`, `AuditRecord { eventType, electionId?, actorUserId?, metadata? }`. Role/purpose are strings ("ADMIN"|"REGISTRAR"|"VOTER", "LOGIN"|"REGISTRATION") because SQLite has no enums — validated via Zod instead.
- **AuditRecord has no FK to User** — actorUserId is a loose reference so audit rows survive user deletion.

## Rate Limits
- Global: 100 requests / 15 min (all /api routes)
- OTP endpoints (`/auth/send-otp`, `/auth/verify-otp`): **5 requests / minute** (brute-force protection on OTP guessing), applied on top of the global limiter

## Seeded Login Confirmation
Both seeded users log in through the new flow (password + LOGIN OTP → JWT): admin returns `{ role: "ADMIN" }`, registrar returns `{ role: "REGISTRAR" }` in the verify-otp response — confirmed by live E2E run.

## OTP "Delivery" (demo)
Codes are logged at info level via Pino (`OTP generated (demo delivery via log)` with email/purpose/code). No real SMS/email. The raw code is never returned in any API response.
