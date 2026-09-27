# VoteChain — Blockchain-Secured E-Voting Platform

Documentation for VoteChain: a verifiable electronic voting platform with four roles (**Registrar**, **Voter**, **Admin**, **Auditor**). Voter privacy is enforced cryptographically (Aadhaar-based identity → OTP verification → anonymous credential → ballot cast → verifiable receipt); integrity is enforced by an append-only ledger that anyone may inspect.

## Quickstart Development Setup

```bash
# 1. Backend — PostgreSQL must be running locally
cd backend
cp .env.example .env 2>/dev/null || true   # then set DATABASE_URL + JWT_SECRET
npm install
npx prisma migrate dev && npx prisma db seed
npm run dev                                 # http://localhost:8080/api/v1

# 2. Frontend
cd frontend
npm install
cp .env.example .env.local                  # NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
npm run dev                                 # http://localhost:3000
```

## Repository layout

| Directory      | Concern                                                        |
| -------------- | -------------------------------------------------------------- |
| `frontend/`    | Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 web app |
| `backend/`     | Express + TypeScript + Prisma API service                      |
| `blockchain/`  | Ledger abstraction (isolated inside `backend/src/blockchain`)   |
| `database/`    | Schema/migrations and user-space PostgreSQL cluster            |
| `documentation/` | This documentation folder                                    |
| `scripts/`     | Orchestration helpers (`setup`, `dev`, `test`, `deploy`)       |

## Documentation map

| File                                          | Contents                                              |
| --------------------------------------------- | ----------------------------------------------------- |
| [architecture.md](architecture.md)            | System layers, request flow, middleware pipeline       |
| [backend.md](backend.md)                      | Backend module guide and how to add a feature          |
| [api.md](api.md)                              | Full REST endpoint reference                           |
| [data-model.md](data-model.md)                | Prisma schema: models, enums, relations                |
| [security.md](security.md)                    | Auth, OTP, RBAC, privacy model, and limitations        |
| [frontend.md](frontend.md)                    | Next.js structure, API client, design system           |
| [blockchain.md](blockchain.md)                | Ledger abstraction layer and data flow of a vote       |
| [testing.md](testing.md)                      | E2E suites, verification commands                      |
| [deployment.md](deployment.md)                | Running locally, env vars, production notes            |
| [limitations.md](limitations.md)              | Known limitations and mock boundaries                  |
| [contributing.md](contributing.md)            | Conventions and PR checklist                           |
| [prd.md](prd.md)                              | Product requirements and feature checklist             |

> Reference docs kept at the repo root: `AGENTS.md` (agent working agreement), `DESIGN.md` (visual tokens), `FILESTRUCTURE.md` (repo tree), `MEMORY.md` (progress log), `PRD.md` (scope checklist).
