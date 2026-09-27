# FILESTRUCTURE.md — Real Folder Tree

> Kept up to date per AGENTS.md. Last updated: 2026-09-26 (login page redesign).

## Repository root

```
/                          # repo root (monorepo)
├── AGENTS.md              # agent working agreement (this workflow)
├── PRD.md                 # scope + feature checklist
├── MEMORY.md              # progress log + decisions & assumptions
├── FILESTRUCTURE.md       # this file
├── DESIGN.md              # visual direction & tokens reference
├── docker-compose.yml     # Multi-container orchestration (PostgreSQL, Backend, Nginx, Frontend)
├── nginx.conf             # Load balancer config for scalable backend nodes
├── backend/               # API service (Express + Prisma; Dockerfile included)
├── blockchain/            # ledger services (isolated abstraction layer in backend/src/blockchain)
├── database/              # Schema/migrations & PostgreSQL DDL/seed scripts
│   ├── README.md          # Database subsystem guide
│   ├── schema.sql         # Standard DDL SQL schema
│   ├── seed/
│   │   └── sample_seed.sql # Standalone sample SQL seed script
│   └── diagrams/
│       └── er_diagram.md  # Mermaid ER diagram
├── documentation/         # Architecture, API, security, testing, deployment, and docker scaling docs
│   └── docker-scalability.md # Docker setup, load balancing & scaling guide
├── scripts/               # orchestration helpers
└── frontend/              # ← Next.js web app
```

## backend/

Stack: Express + TypeScript + Prisma (PostgreSQL) · JWT auth · RBAC · Zod · Pino · Hyperledger Fabric Abstraction

```
backend/
├── package.json               # scripts: dev, build, start, prisma:*
├── tsconfig.json
├── .env                       # local config (PORT=8080, DATABASE_URL socket)
├── prisma/
│   ├── schema.prisma          # 11 models + enums
│   └── seed.ts                # 50 Aadhaar, admin, registrar, auditor, 10 voters
├── tests/
│   ├── auth.e2e.sh            # 15-case auth test
│   ├── registrar.e2e.sh       # 10-case registrar test
│   └── workflow.e2e.sh        # Complete E2E business workflow suite (Phases 1-5)
└── src/
    ├── app.ts                 # helmet, cors, rate-limit, pino-http, route mounting
    ├── server.ts              # listen + graceful shutdown
    ├── config/index.ts        # env validation (includes Fabric config)
    ├── blockchain/
    │   ├── types.ts           # Fabric block/transaction & input types
    │   ├── fabric.client.ts   # Fabric client connection manager
    │   ├── fabric.gateway.ts  # Gateway with transaction submission & query map
    │   ├── fabric.service.ts  # Isolated Fabric service API layer
    │   └── transactions.ts   # Ballot hash formatter & ledger event logger
    ├── middleware/
    │   ├── auth.middleware.ts     # authenticate() JWT + authorize()/requireRole() RBAC
    │   ├── validate.middleware.ts # generic Zod body/query/params validation
    │   ├── errorHandler.ts        # AppError + centralized handler
    │   └── notFound.ts
    ├── validators/
    │   ├── auth.validator.ts
    │   ├── registrar.validator.ts
    │   ├── admin.validator.ts
    │   ├── election.validator.ts
    │   ├── candidate.validator.ts
    │   ├── voting.validator.ts
    │   ├── blockchain.validator.ts
    │   └── audit.validator.ts
    ├── repositories/
    │   ├── aadhaar.repository.ts
    │   ├── voter.repository.ts
    │   ├── user.repository.ts
    │   ├── otp.repository.ts
    │   ├── election.repository.ts
    │   ├── candidate.repository.ts
    │   ├── credential.repository.ts
    │   ├── voting.repository.ts
    │   ├── blockchain.repository.ts
    │   └── audit.repository.ts
    ├── services/
    │   ├── auth.service.ts
    │   ├── registrar.service.ts
    │   ├── admin.service.ts
    │   ├── election.service.ts
    │   ├── voting.service.ts
    │   ├── blockchain.service.ts
    │   └── audit.service.ts
    ├── controllers/
    │   ├── auth.controller.ts
    │   ├── registrar.controller.ts
    │   ├── admin.controller.ts
    │   ├── election.controller.ts
    │   ├── voting.controller.ts
    │   ├── blockchain.controller.ts
    │   └── audit.controller.ts
    ├── routes/
    │   ├── health.routes.ts
    │   ├── auth.routes.ts
    │   ├── registrar.routes.ts
    │   ├── admin.routes.ts
    │   ├── election.routes.ts
    │   ├── candidate.routes.ts
    │   ├── voting.routes.ts
    │   ├── blockchain.routes.ts
    │   └── audit.routes.ts
    ├── crypto/
    │   └── otp.ts
    └── utils/
        ├── logger.ts
        └── prisma.ts
```

## frontend/

Stack: Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS v4 · axios · ESLint 9 · npm
