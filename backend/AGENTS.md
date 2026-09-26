# AGENTS.md — Project Working Agreement

## Project

E-voting platform backend (`evote-backend`) — Node.js + TypeScript + Express + Prisma (SQLite in dev). Built prompt-by-prompt; each prompt = one commit.

## Conventions

- **Language/stack**: TypeScript (strict), Express 4, Prisma + SQLite, Zod for validation, Pino for logging, JWT for auth.
- **Layering (strict)**: routes → validation → controller (thin) → service (business logic) → repository (data access) → Prisma.
- **Crypto**: passwords via bcrypt (`src/crypto/password.ts`), OTPs via HMAC-SHA256 + server-side pepper (`src/crypto/otp.ts`), JWTs via `src/crypto/jwt.ts` with secret from config/env. Never store plaintext passwords or raw OTP codes.
- **Validation**: every request body goes through a Zod schema in `src/validators/` applied by `validate` middleware before controllers.
- **Errors**: controllers catch `AuthError` (status + generic message); failed logins always return a generic 401 — never reveal whether email or password was wrong.
- **Audit**: any security-relevant action calls `audit.service.logEvent` — generic interface (`eventType`, `electionId?`, `actorUserId?`, `metadata?`), shared by all future modules.
- **Rate limiting**: global limiter on all routes; strict limiter (5 req/min) on `/auth/send-otp` and `/auth/verify-otp`.
- **Blockchain**: only code in `src/blockchain/` may reference Hyperledger Fabric. Nothing else scaffolds it early.
- **JWT payload**: `{ userId, role, sessionId }` only — no candidate/ballot data ever goes in tokens.
- **SQLite note**: no enum support — role/purpose are validated at the app layer (Zod), stored as strings.

## Before touching anything

1. Read `PRD.md` for current phase scope.
2. Read `MEMORY.md` for what prior prompts established (seeds, schema fields, decisions).
3. Read `FILESTRUCTURE.md` before creating files; update it after adding files.
4. Keep each prompt to exactly one commit with a conventional message like `feat(auth): ...`.

## Verification before committing

- `npm run typecheck` passes.
- End-to-end flow exercised with live server + curl.
- Docs updated: `FILESTRUCTURE.md`, `MEMORY.md`, `PRD.md` checkboxes.
