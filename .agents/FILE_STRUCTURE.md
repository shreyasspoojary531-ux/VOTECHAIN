# FILESTRUCTURE.md — VoteChain

This file is maintained by the AI, not hand-written. Update it in the same prompt as any change that adds, moves, renames, or removes a file or folder. This exists so the AI (and Shreyas) can find things instantly instead of searching the whole repo — keep it accurate and detailed.

## Status

Project scaffold created according to multi-service architecture (Frontend, Backend, Blockchain, Database, Docs, Scripts, GitHub CI/CD).

## File Structure

```
.
├── README.md
├── LICENSE
├── .gitignore
├── .env.example
├── docker-compose.yml
├── docker-compose.dev.yml
├── Makefile
│
├── frontend/
│   ├── README.md
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   │
│   ├── public/
│   │
│   └── src/
│       ├── app/
│       │   ├── page.tsx
│       │   ├── login/
│       │   ├── verify/
│       │   ├── elections/
│       │   ├── vote/
│       │   ├── verification/
│       │   ├── blockchain/
│       │   ├── audit/
│       │   └── admin/
│       │
│       ├── components/
│       │   ├── ui/
│       │   ├── navigation/
│       │   ├── election/
│       │   ├── voting/
│       │   ├── blockchain/
│       │   └── audit/
│       │
│       ├── features/
│       │   ├── auth/
│       │   ├── election/
│       │   ├── voting/
│       │   ├── verification/
│       │   ├── blockchain/
│       │   └── audit/
│       │
│       ├── services/
│       │   ├── api.ts
│       │   ├── auth.api.ts
│       │   ├── election.api.ts
│       │   ├── voting.api.ts
│       │   ├── verification.api.ts
│       │   ├── blockchain.api.ts
│       │   └── audit.api.ts
│       │
│       ├── hooks/
│       ├── types/
│       ├── utils/
│       ├── config/
│       └── middleware.ts
│
├── backend/
│   ├── README.md
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   │
│   ├── prisma/
│   │   ├── schema.prisma   — Complete 11-model Prisma database schema
│   │   ├── migrations/     — Generated SQL migration history
│   │   └── seed.ts         — Database seeder (50 MockAadhaar, Admin, Registrar, 3 Voters)
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── index.ts        — Centralized typed env configuration
│   │   ├── routes/
│   │   │   └── health.routes.ts — Health check route (/api/v1/health)
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts  — Centralized Express error handler
│   │   │   └── notFound.ts      — 404 handler
│   │   ├── validators/
│   │   ├── crypto/
│   │   ├── blockchain/
│   │   ├── utils/
│   │   │   └── logger.ts        — Pino logger instance
│   │   ├── types/
│   │   ├── app.ts               — Express application & middleware configuration
│   │   └── server.ts            — HTTP server listener & graceful shutdown
│   │
│   └── tests/
│
├── blockchain/
│   ├── README.md
│   ├── network/
│   ├── chaincode/
│   │   └── votechain/
│   │       ├── src/
│   │       └── package.json
│   ├── config/
│   └── scripts/
│
├── database/
│   ├── README.md
│   ├── migrations/
│   ├── seed/
│   └── diagrams/
│
├── docs/
│   ├── README.md
│   │
│   ├── architecture/
│   │   ├── system-architecture.md
│   │   ├── frontend-architecture.md
│   │   ├── backend-architecture.md
│   │   ├── authentication-flow.md
│   │   ├── voting-flow.md
│   │   ├── blockchain-flow.md
│   │   └── verification-flow.md
│   │
│   ├── api/
│   │   ├── README.md
│   │   ├── authentication.md
│   │   ├── elections.md
│   │   ├── voting.md
│   │   ├── blockchain.md
│   │   └── audit.md
│   │
│   ├── database/
│   │   └── data-model.md
│   │
│   ├── security/
│   │   ├── threat-model.md
│   │   ├── cryptography.md
│   │   ├── privacy-model.md
│   │   └── security-considerations.md
│   │
│   ├── deployment/
│   │   ├── local-development.md
│   │   ├── docker.md
│   │   └── production.md
│   │
│   └── limitations.md
│
├── scripts/
│   ├── setup.sh
│   ├── dev.sh
│   ├── test.sh
│   └── deploy.sh
│
└── .github/
    ├── workflows/
    │   ├── ci.yml
    │   └── docker.yml
    ├── pull_request_template.md
    └── ISSUE_TEMPLATE/
```
