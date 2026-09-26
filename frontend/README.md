# e-Voting — Frontend

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 web client for the blockchain-secured e-voting platform.

## Getting started

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE_URL
npm run dev                  # http://localhost:3000
```

## Scripts

| Command             | Purpose                    |
| ------------------- | -------------------------- |
| `npm run dev`       | Development server         |
| `npm run build`     | Production build           |
| `npm run start`     | Serve the production build |
| `npm run lint`      | ESLint (flat config)       |
| `npm run typecheck` | `tsc --noEmit`             |

## Layout

- `src/app/` — routes (App Router). Placeholder routes render `src/components/coming-soon.tsx`.
- `src/services/` — API layer. `api.ts` owns the single axios instance (base URL from `NEXT_PUBLIC_API_BASE_URL`, JWT + error interceptors); `*.api.ts` files export typed endpoint functions.
- `src/types/` — shared domain types.
- Design tokens live in `src/app/globals.css` (`@theme`, Tailwind v4). See the repo-root `DESIGN.md`.

See root `AGENTS.md` for conventions and `PRD.md` for the feature checklist.
