# FILESTRUCTURE.md — Real Folder Tree

> Kept up to date per AGENTS.md. Last updated: 2026-09-26 (scaffold commit).

## Repository root

```
/                          # repo root (monorepo)
├── AGENTS.md              # agent working agreement (this workflow)
├── PRD.md                 # scope + feature checklist
├── MEMORY.md              # progress log + decisions & assumptions
├── FILESTRUCTURE.md       # this file
├── DESIGN.md              # visual direction & tokens reference
├── backend/               # API service (empty scaffold, separate prompt)
├── blockchain/            # ledger services (separate prompt)
├── database/              # schema/migrations (separate prompt)
├── docs/                  # architecture/API/security docs (empty placeholders)
├── scripts/               # orchestration helpers
└── frontend/              # ← Next.js web app (this scaffold)
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
    │   │   ├── page.tsx       # /elections
    │   │   └── [id]/page.tsx  # /elections/[id]
    │   ├── vote/
    │   │   └── [electionId]/page.tsx       # /vote/[electionId]
    │   ├── verification/
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
    │   └── coming-soon.tsx    # shared placeholder for scaffold routes
    ├── services/
    │   ├── api.ts             # centralized axios client + JWT/error interceptor stubs
    │   ├── auth.api.ts        # POST /auth/register, /auth/login (typed stubs)
    │   ├── otp.api.ts         # POST /auth/send-otp, /auth/verify-otp
    │   ├── registration.api.ts# GET /registrar/aadhaar/search, POST /registrar/register-voter
    │   ├── election.api.ts    # GET+POST /elections
    │   ├── voting.api.ts      # POST /votes, GET /votes/receipt/:txId
    │   ├── blockchain.api.ts  # GET /blockchain/blocks, /blockchain/transactions/:txId
    │   └── audit.api.ts       # GET /audit/elections/:id
    ├── types/
    │   └── index.ts           # Role, Voter, Candidate, Election, Vote, BlockchainTransaction, Block, AuditEvent, Paginated
    ├── lib/                   # helper functions & utilities
    ├── hooks/                 # custom React hooks
    └── context/               # React context providers
```

## Conventions

- Route groups that will need shared guards/chrome (`registrar`, `admin`, `blockchain`, `audit`) own a segment `layout.tsx`.
- One service file per domain, all importing the single client from `services/api.ts`.
- Design tokens are CSS-first (`@theme` in `globals.css`); no `tailwind.config.js` exists by design (Tailwind v4).
