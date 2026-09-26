# FILESTRUCTURE.md — Real Folder Tree

> Kept up to date per AGENTS.md. Last updated: 2026-09-26 (registrar backend commit).

## Repository root

```
/                          # repo root (monorepo)
├── AGENTS.md              # agent working agreement (this workflow)
├── PRD.md                 # scope + feature checklist
├── MEMORY.md              # progress log + decisions & assumptions
├── FILESTRUCTURE.md       # this file
├── DESIGN.md              # visual direction & tokens reference
├── backend/               # API service (Express + Prisma; registrar module live)
├── blockchain/            # ledger services (separate prompt)
├── database/              # schema/migrations (separate prompt)
├── docs/                  # architecture/API/security docs (empty placeholders)
├── scripts/               # orchestration helpers
└── frontend/              # ← Next.js web app
```

## backend/

Stack: Express + TypeScript + Prisma (PostgreSQL) · JWT auth · RBAC · Zod · Pino

```
backend/
├── package.json               # scripts: dev, build, start, prisma:*
├── tsconfig.json
├── Dockerfile
├── .env                       # local only (PORT=8080 for frontend parity)
├── prisma/
│   ├── schema.prisma          # 11 models + enums
│   ├── migrations/20260926084701_init/
│   └── seed.ts                # 50 Aadhaar (5 minors), admin/registrar/3 voters
├── tests/
│   └── registrar.e2e.sh       # 10-case endpoint test (401/403/400/404/409/422/201/200)
└── src/
    ├── app.ts                 # helmet, cors, rate-limit, pino-http, route mounting
    ├── server.ts              # listen + graceful shutdown
    ├── config/index.ts        # env validation
    ├── middleware/
    │   ├── auth.middleware.ts     # authenticate() JWT + authorize()/requireRole() RBAC
    │   ├── validate.middleware.ts # generic Zod body/query/params validation (422)
    │   ├── errorHandler.ts        # AppError + centralized handler
    │   └── notFound.ts
    ├── validators/
    │   └── registrar.validator.ts
    ├── repositories/
    │   ├── aadhaar.repository.ts  # minimal-PII select + alreadyRegistered flag
    │   └── voter.repository.ts    # transactional create + paginated list
    ├── services/
    │   └── registrar.service.ts   # age gate, $transaction, VOTER_REGISTERED audit
    ├── controllers/
    │   └── registrar.controller.ts
    ├── routes/
    │   ├── health.routes.ts
    │   └── registrar.routes.ts    # authenticate + requireRole('REGISTRAR')
    └── utils/
        ├── logger.ts
        └── prisma.ts
```

## frontend/

Stack: Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS v4 · axios · ESLint 9 · npm

```
frontend/
├── package.json               # scripts: dev, build, start, lint, format, typecheck
├── tsconfig.json              # strict: true, bundler resolution, @/* → src/*
├── next.config.ts
├── postcss.config.mjs         # Tailwind v4 via @tailwindcss/postcss
├── eslint.config.mjs          # flat config: next/core-web-vitals + next/typescript + eslint-config-prettier
├── .prettierrc                # Prettier configuration (semi, singleQuote, trailingComma, printWidth)
├── .gitignore                 # frontend-scoped (root .gitignore is root-anchored)
├── .env.example               # NEXT_PUBLIC_API_BASE_URL
├── .env.local.example         # NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
├── public/                    # static assets (empty)
└── src/
    ├── app/
    │   ├── layout.tsx         # root layout: Inter + Geist Mono + Fraunces (next/font), black canvas
    │   ├── globals.css        # Tailwind v4 import + @theme design tokens (DESIGN.md)
    │   ├── (public)/
    │   │   └── page.tsx       # /
    │   ├── (auth)/
    │   │   ├── login/page.tsx # /login
    │   │   ├── register/page.tsx # /register
    │   │   └── otp/page.tsx   # /otp
    │   ├── registrar/
    │   │   ├── layout.tsx     # guard attachment point (renders children)
    │   │   ├── dashboard/page.tsx          # /registrar/dashboard
    │   │   ├── aadhaar-search/page.tsx     # /registrar/aadhaar-search
    │   │   ├── register-voter/page.tsx     # /registrar/register-voter
    │   │   └── voters/page.tsx             # /registrar/voters
    │   ├── admin/
    │   │   ├── layout.tsx     # guard attachment point
    │   │   ├── dashboard/page.tsx          # /admin/dashboard
    │   │   ├── elections/page.tsx          # /admin/elections
    │   │   ├── create-election/page.tsx    # /admin/create-election
    │   │   ├── candidates/page.tsx         # /admin/candidates
    │   │   └── results/page.tsx            # /admin/results
    │   ├── elections/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx       # /elections
    │   │   └── [id]/page.tsx  # /elections/[id]
    │   ├── vote/
    │   │   ├── layout.tsx
    │   │   └── [electionId]/page.tsx       # /vote/[electionId]
    │   ├── verification/
    │   │   ├── layout.tsx
    │   │   └── [txId]/page.tsx             # /verification/[txId]
    │   ├── blockchain/
    │   │   ├── layout.tsx
    │   │   ├── explorer/page.tsx           # /blockchain/explorer
    │   │   ├── transaction/[txId]/page.tsx # /blockchain/transaction/[txId]
    │   │   └── block/[blockId]/page.tsx    # /blockchain/block/[blockId]
    │   └── audit/
    │       ├── layout.tsx
    │       └── dashboard/page.tsx          # /audit/dashboard
    ├── components/
    │   ├── coming-soon.tsx    # shared placeholder for scaffold routes
    │   ├── navbar.tsx         # responsive role-based navigation shell
    │   ├── role-guard.tsx     # client component for route protection
    │   ├── ui/
    │   │   ├── button.tsx       # Button component (primary, secondary, danger, ghost)
    │   │   ├── input.tsx        # Input & Label components
    │   │   ├── card.tsx         # Card, CardHeader, CardTitle, CardContent, CardFooter
    │   │   ├── status-badge.tsx # StatusBadge component (success, danger, warning, neutral, accent)
    │   │   └── skeleton.tsx     # Skeleton loader component
    │   └── visuals/
    │       ├── chain-visual.tsx # Block linkage visualization component
    │       ├── vote-journey-visual.tsx # Cryptographic 5-step vote journey diagram
    │       └── privacy-architecture-visual.tsx # Identity-Ballot decoupling diagram
    ├── services/
    │   ├── api.ts             # centralized fetch wrapper apiClient<T> + ApiError
    │   ├── auth.api.ts        # POST /auth/register, /auth/login (typed stubs)
    │   ├── otp.api.ts         # POST /auth/send-otp, /auth/verify-otp
    │   ├── registration.api.ts# GET /registrar/aadhaar/search, POST /registrar/register-voter
    │   ├── election.api.ts    # GET+POST /elections
    │   ├── voting.api.ts      # POST /votes, GET /votes/receipt/:txId
    │   ├── blockchain.api.ts  # GET /blockchain/blocks, /blockchain/transactions/:txId
    │   └── audit.api.ts       # GET /audit/elections/:id
    ├── types/
    │   └── index.ts           # Domain types (User, Auth, Registrar, Election, Voting, Blockchain, Audit, Paginated)
    ├── lib/
    │   └── auth-token.ts      # Auth token store abstraction (getToken, setToken, clearToken)
    ├── hooks/                 # custom React hooks
    └── context/
        └── AuthContext.tsx    # Auth state provider (user, token, login, logout, loading)
```

## Conventions

- Route groups that will need shared guards/chrome (`registrar`, `admin`, `blockchain`, `audit`, `elections`, `vote`, `verification`) own a segment `layout.tsx`.
- One service file per domain, all importing the single client from `services/api.ts`.
- Design tokens are CSS-first (`@theme` in `globals.css`); no `tailwind.config.js` exists by design (Tailwind v4).
