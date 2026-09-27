# Contributing

## Repo conventions

- **Package manager:** npm. **Stack:** Next.js 15 App Router + TypeScript + Tailwind v4 (frontend), Express + TypeScript + Prisma (backend).
- **Path alias:** `@/*` → `frontend/src/*`.
- One logical task = one commit. Never push without being asked.
- After structural changes, update `FILESTRUCTURE.md`; after meaningful progress, append to `MEMORY.md` (Progress Log + Decisions & Assumptions); tick completed PRD checkboxes in the same commit.

## Working agreement for agents

Read before any task, in this order: `PRD.md` → `MEMORY.md` → `FILESTRUCTURE.md` → `DESIGN.md` → `documentation/api.md` (endpoint contracts when wiring services). Full text lives in root `AGENTS.md`.

## Frontend rules

- All backend calls through `frontend/src/services/api.ts` and typed `services/*.api.ts` wrappers — never `axios`/`fetch` directly.
- Shared domain types in `frontend/src/types/index.ts`; API param/result types next to their service.
- Design tokens via utility classes from `@theme` in `globals.css` (`bg-canvas`, `border-hairline`, `font-mono`); no hardcoded hex values in components.
- Placeholder routes render the shared `ComingSoon` component; no business logic before the corresponding PRD checkbox exists.
- Client-exposed config in `NEXT_PUBLIC_*` vars, documented in `frontend/.env.example`. Never commit real `.env` files.

## Backend rules

- Respect layering: routes → validate (Zod) → authenticate/requireRole → controller → service → repository. Controllers never touch Prisma; services never touch `req`/`res`.
- Domain errors as `AppError` with a stable machine-readable code.
- New modules follow the pattern in [backend.md](backend.md#adding-a-feature-convention).

## Definition of done

1. `cd frontend && npm run lint && npm run typecheck && npm run build` — clean.
2. `cd backend && npx tsc --noEmit && npm run build` — clean.
3. Relevant E2E suite(s) in `backend/tests/` pass (see testing.md).
4. Pages expose loading / error (`role="alert"`) / empty / loaded states; mobile-first; keyboard navigable.
5. Zero exposed secrets or raw stack traces.

## Commit style

Conventional Commits are in use historically, e.g. `chore(backend-scaffold): initialize Express TS backend with Postgres and centralized error handling`.
