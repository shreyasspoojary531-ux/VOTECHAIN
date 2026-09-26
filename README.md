# VoteChain — Blockchain-Secured E-Voting Platform

A verifiable electronic voting platform with four roles (Registrar, Voter, Admin, Auditor). Voter privacy is enforced cryptographically (Aadhaar-based identity → OTP verification → ballot cast → verifiable receipt); integrity is enforced by an append-only ledger that anyone may inspect.

## Quickstart

```bash
# Backend (PostgreSQL must be running locally)
cd backend
npm install
npx prisma migrate dev && npx prisma db seed
npm run dev            # http://localhost:8080/api/v1

# Frontend
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
npm run dev            # http://localhost:3000
```

## Repository layout

| Directory        | Concern                                                        |
| ---------------- | -------------------------------------------------------------- |
| `frontend/`      | Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 web app |
| `backend/`       | Express + TypeScript + Prisma API service                      |
| `blockchain/`    | Ledger abstraction (isolated inside `backend/src/blockchain`)  |
| `database/`      | Schema/migrations and user-space PostgreSQL cluster            |
| `documentation/` | All project documentation (start at `documentation/README.md`) |
| `scripts/`       | Orchestration helpers                                          |

## Documentation

Full documentation lives in [`documentation/`](documentation/README.md): architecture, API reference, data model, security model, testing, deployment, and limitations.

## Scripts

| Location           | Commands |
| ------------------ | -------- |
| `backend/`         | `npm run dev`, `npm run build`, `npm start`, `npm run prisma:generate`, `npm run prisma:migrate`, `npm run prisma:seed` |
| `frontend/`        | `npm run dev`, `npm run build`, `npm start`, `npm run lint`, `npm run typecheck`, `npm run format` |

## Requirements

- Node.js 20+
- PostgreSQL 16
