# Architecture

## High-level system

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Voter / Staff)                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────▼──────────────────────────────────┐
│  frontend/ — Next.js 15 App Router, TS strict, Tailwind v4       │
│  • Role-based routing: /registrar /admin /elections /audit        │
│  • Single axios instance with JWT + error interceptors            │
└──────────────────────────────┬──────────────────────────────────┘
                               │ REST/JSON  (base: /api/v1)
┌──────────────────────────────▼──────────────────────────────────┐
│  backend/ — Express + TypeScript                                  │
│  helmet → cors → rate-limit → pino-http → routes                  │
│  route → validate (Zod) → authenticate/requireRole → controller   │
│    → service → repository → Prisma (PostgreSQL)                   │
└───────────────┬─────────────────────────────────┬───────────────┘
                │                                 │
┌───────────────▼───────────────┐   ┌─────────────▼────────────────┐
│  PostgreSQL (Prisma)           │   │  Ledger abstraction layer     │
│  identity, elections, ballots, │   │  backend/src/blockchain/*     │
│  credentials, audit records    │   │  (Hyperledger Fabric-ready)   │
└───────────────────────────────┘   └──────────────────────────────┘
```

## Layered backend

| Layer           | Location                          | Responsibility                                        |
| --------------- | --------------------------------- | ----------------------------------------------------- |
| Routes          | `backend/src/routes/`             | HTTP verbs, mounting, route-level middleware chains   |
| Validators      | `backend/src/validators/`         | Zod schemas for body/query/params                     |
| Middleware      | `backend/src/middleware/`         | `authenticate()` JWT, `requireRole()` RBAC, `validate` |
| Controllers     | `backend/src/controllers/`        | Parse request → call service → shape response         |
| Services        | `backend/src/services/`           | Business rules, error mapping (`AppError`)            |
| Repositories    | `backend/src/repositories/`       | Prisma queries, atomic transactions                   |
| Blockchain      | `backend/src/blockchain/`         | Isolated ledger client/service (see blockchain.md)    |
| Cross-cutting   | `config/`, `utils/logger.ts`, `crypto/otp.ts` | Env validation, logging, OTP crypto       |

**Rule:** controllers never touch Prisma, services never touch `req`/`res`. Requests flow strictly downward; errors bubble to the centralized `errorHandler`.

## Request lifecycle

1. `helmet` sets security headers.
2. `cors` allows the configured `CORS_ORIGIN` with credentials.
3. `express-rate-limit` enforces `RATE_LIMIT_MAX` requests per `RATE_LIMIT_WINDOW_MS` (default 100 / 15 min) and returns `429 RATE_LIMIT_EXCEEDED`.
4. `pino-http` logs each request (skips `/api/v1/health`).
5. Route-level `validate({ body | query | params })` runs the Zod schema; failures become `422`.
6. `authenticate` verifies the JWT and attaches `req.user`; `requireRole('…')` enforces RBAC (`403` on mismatch).
7. Controller → service → repository. Domain failures are raised as `AppError` with a stable `code`.
8. Success responses use the envelope `{ success: true, data }`; errors are normalized by `errorHandler` to `{ error: { message, code, status } }`.

## Frontend architecture

- **App Router** with one folder per route under `frontend/src/app`; shared chrome (nav, guards) lives in segment `layout.tsx` files.
- **API access** goes through `frontend/src/services/api.ts` (single axios instance: base URL from `NEXT_PUBLIC_API_BASE_URL`, JWT header injection, `{ success, data }` envelope auto-unwrapping, `ApiError { status, message }` normalization). Feature modules import typed `services/*.api.ts` wrappers — never `axios`/`fetch` directly.
- **Auth UX** uses `hooks/useRequireAuth.ts` for client-side redirect/role gating; the backend remains the authority on capabilities.
- **Design tokens** are CSS-first in `src/app/globals.css` under `@theme` (Tailwind v4). See root `DESIGN.md`.

## Key runtime flows

- **Login (voter):** `POST /auth/login` → `otpRequired: true` + `pendingToken` → `POST /auth/send-otp` → `POST /auth/verify-otp` → session JWT. Details in security.md.
- **Vote cast:** credential → ballot hash → ledger submit → atomic DB transaction → receipt. Details in blockchain.md.
- **Verification:** receipt lookup by `txId`, plus ledger-side `verifyTransaction` / `verifyElectionChain` for auditors.
