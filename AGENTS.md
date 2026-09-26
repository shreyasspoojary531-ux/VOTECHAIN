# AGENTS.md — Working Agreement for AI Coding Agents

## Project

Blockchain-secured e-voting platform. This repository holds the full stack:

| Directory   | Concern                                                        |
| ----------- | -------------------------------------------------------------- |
| `frontend/` | Next.js (TypeScript) web app — **this is where UI work lives** |
| `backend/`  | API service                                                    |
| `blockchain/` | Ledger / chain services                                      |
| `database/` | Schema and migrations                                          |
| `docs/`     | Architecture, API contracts, security model (read before feature work) |
| `scripts/`  | Orchestration helpers                                          |

## Source of truth (read in this order before any task)

1. `PRD.md` — scope and feature checklist (tick boxes as work lands).
2. `MEMORY.md` — progress log and decisions & assumptions made so far.
3. `FILESTRUCTURE.md` — real folder tree; update it whenever files are added/removed.
4. `DESIGN.md` — visual direction: tokens, typography, layout language.
5. `docs/api/*.md` — endpoint contracts when wiring services.

## Frontend conventions

- **Stack:** Next.js App Router + TypeScript + Tailwind CSS v4 + axios. Package manager: **npm**.
- **Path alias:** `@/*` → `frontend/src/*`.
- **Routes:** one folder per route under `frontend/src/app`, matching the route map in `FILESTRUCTURE.md`. Shared chrome (nav, guards) goes in segment `layout.tsx` files, never duplicated per page.
- **API access:** all backend calls go through `frontend/src/services/api.ts` (single axios instance; JWT header + error normalization live in its interceptors). Feature modules import the typed `*.api.ts` wrappers — never `axios` directly, never `fetch`.
- **Types:** shared domain types live in `frontend/src/types/index.ts`. API param/result types live next to their service (`services/*.api.ts`).
- **Design tokens:** defined CSS-first in `frontend/src/app/globals.css` under `@theme` (Tailwind v4). Use utility classes (`bg-canvas`, `border-hairline`, `font-mono`); do not hardcode hex values in components. Fonts are loaded once in `src/app/layout.tsx` via `next/font/google` (Inter, Geist Mono, Fraunces).
- **Env:** client-exposed config goes in `NEXT_PUBLIC_*` vars, documented in `frontend/.env.example`. Never commit real `.env` files.

## Workflow rules

- One logical task = one commit. Never push without being asked.
- After structural changes, update `FILESTRUCTURE.md`; after meaningful progress, append to `MEMORY.md` (Progress Log + Decisions & Assumptions); tick completed PRD checkboxes in the same commit.
- Verify before declaring done: `npm run lint`, `npm run typecheck`, `npm run build` inside `frontend/` must pass.
- Placeholder routes render the shared `ComingSoon` component; do not implement page content or business logic before the corresponding prompt/checkbox exists.
