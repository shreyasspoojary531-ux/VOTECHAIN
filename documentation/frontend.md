# Frontend

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS v4 · axios · ESLint 9 · npm. Path alias: `@/*` → `frontend/src/*`.

## Commands

```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
npm run dev                  # http://localhost:3000
npm run build
npm run start
npm run lint
npm run typecheck
npm run format
```

## Layout

- `src/app/` — routes (App Router), one folder per route. Shared chrome (nav, guards) lives in segment `layout.tsx` files, never duplicated per page.
- `src/services/` — API layer. `api.ts` owns the single axios instance: base URL from `NEXT_PUBLIC_API_BASE_URL`, JWT header injection, `{ success, data }` envelope auto-unwrapping, and `ApiError { status, message }` normalization (including nested `{ error: { message, code } }` payloads). Typed endpoint wrappers live in `*.api.ts`.
- `src/types/index.ts` — shared domain types (timestamps as epoch milliseconds).
- `src/components/` — shared UI (e.g. `Navbar.tsx`, `AppShell.tsx`, `Nav.tsx`, `role-guard.tsx`, `coming-soon.tsx`).
- `src/hooks/useRequireAuth.ts` — client-side auth/role redirect hook (`/login` redirect, dashboard redirect for auth pages). UX-only gating; the backend is the authority.

## Routes (role map)

| Segment        | Routes |
| -------------- | ------ |
| Public         | `/` landing, `/login`, `/register`, `/otp`, `/elections`, `/vote`, `/verification`, `/blockchain/explorer`, `/blockchain/transaction`, `/blockchain/block` |
| REGISTRAR      | `/registrar/dashboard`, `/registrar/aadhaar-search`, `/registrar/register-voter`, `/registrar/voters` |
| ADMIN          | `/admin/dashboard`, `/admin/elections`, `/admin/create-election`, `/admin/candidates`, `/admin/results` |
| AUDITOR        | `/audit/dashboard` |

Placeholder routes render the shared `ComingSoon` component until their PRD checkbox lands.

## API access rules

- All backend calls go through `frontend/src/services/api.ts` — feature modules import typed `services/*.api.ts` wrappers, **never** `axios`/`fetch` directly.
- Auth state (session vs `otpRequired` + `pendingToken`) matches the backend contract: staff roles get `{ jwt, user }` immediately; voters proceed through `/otp`.

## Design system

- Tokens are defined CSS-first in `src/app/globals.css` under `@theme` (Tailwind v4) — there is no `tailwind.config.ts`. Use utility classes (`bg-canvas`, `border-hairline`, `font-mono`); never hardcode hex values in components.
- Fonts loaded once in `src/app/layout.tsx` via `next/font/google` (Inter, Geist Mono, Fraunces). Any hash/id/address renders in `font-mono`.
- Full visual direction, tokens, and component principles: root `DESIGN.md`.

## Quality gates

`npm run lint`, `npm run typecheck`, and `npm run build` must pass before declaring work done. Pages must expose explicit loading, error (`role="alert"`), empty, and loaded states; zero direct network calls outside `services/api.ts`; no exposed secrets or raw stack traces.
