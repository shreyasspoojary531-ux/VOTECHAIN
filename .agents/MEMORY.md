# MEMORY.md — VoteChain Project Memory

This file is the project's living memory. Update it after **every** prompt — this is not optional. Git commit history is only one section of this file, not the whole file.

## Project Context (short)

VoteChain — privacy-preserving digital voting system prototype (fake/demo data only). Initialized Express TypeScript backend scaffold with Docker multi-stage build, Postgres service in docker-compose, Prisma schema foundation, Pino logging, Helmet, CORS, rate limiting, and centralized error handling.

---

## Progress Log

*(Newest entry on top. One entry per prompt: what was built, key choices made.)*

- Scaffolded Express + TypeScript backend foundation in `backend/` with Docker, Postgres docker-compose integration, Prisma schema initialization, Pino HTTP logger, Helmet, CORS, rate limiting, centralized error handler, 404 handler, and `/api/v1/health` route.
- Created raw multi-service folder and file structure per `FILESTRUCTURE.md` request (containing `frontend/`, `backend/`, `blockchain/`, `database/`, `docs/`, `scripts/`, `.github/`). Updated `.agents/FILE_STRUCTURE.md`.

---

## Errors & Fixes

- `prisma generate` failed with exit code 1 because no models are defined yet in `schema.prisma`. Verified this is expected per prompt constraints (models will be added in subsequent Phase 2 prompts).

---

## Decisions & Assumptions

- **Rate Limit Defaults**: Configured `express-rate-limit` with a default window of 15 minutes (`900,000ms`) and a maximum limit of 100 requests per IP (`RATE_LIMIT_MAX=100`), return status 429 with JSON payload `{ error: { message, code: "RATE_LIMIT_EXCEEDED", status: 429 } }`.
- **CORS Defaults**: Allowed origin defaults to `http://localhost:3000` via `CORS_ORIGIN` env var, with credentials enabled.
- **Src Layout & Fail-Fast Config**: Organised backend modularly into `config/`, `routes/`, `controllers/`, `services/`, `repositories/`, `models/`, `middleware/`, `validators/`, `crypto/`, `blockchain/`, `utils/`, `types/`. Enforced fail-fast validation in `config/index.ts` requiring `DATABASE_URL` and `JWT_SECRET`.
- **PRD Checkpoints**: Phase 2 Checkpoint 1 initialized (foundation scaffold ready; full Prisma models and API endpoints will be completed in subsequent prompts).

---

## Git Commit History

- `6bb0e7d` `chore(scaffold): create initial project folder structure`