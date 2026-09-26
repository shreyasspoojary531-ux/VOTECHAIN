# FILESTRUCTURE.md

```
backend/
├── AGENTS.md                     # Working agreement (conventions, layering)
├── PRD.md                        # Phase checklist
├── MEMORY.md                     # Cross-prompt memory (decisions, seeds, limits)
├── FILESTRUCTURE.md              # This file
├── .env / .env.example           # DATABASE_URL (postgresql), JWT, OTP, Fabric vars
├── .gitignore
├── Dockerfile                    # Multi-stage build (node:22-alpine)
├── docker-compose.yml            # postgres:17 + backend
├── package.json                  # Scripts: dev, build, typecheck, prisma:push, seed
├── tsconfig.json
├── prisma/
│   ├── schema.prisma             # 11 models, 4+ enums, PostgreSQL
│   ├── migrations/               # init migration
│   └── seed.ts                   # 50 Aadhaar citizens, 3 staff, 10 voters, election + 4 candidates
└── src/
    ├── app.ts                    # Express app; /api/v1/{auth,registrar,elections,votes,blockchain,audit}
    ├── server.ts                 # Entrypoint
    ├── blockchain/               # ONLY dir that references Fabric
    │   ├── types.ts              # SubmitVoteInput, ChainTransaction, Block, VerificationResult
    │   ├── fabric.client.ts      # Simulated hash-chained ledger (demo)
    │   ├── fabric.gateway.ts     # Simulated-vs-real switch boundary
    │   ├── fabric.service.ts     # Public API: submitVote/getTransaction/getBlock/verifyTransaction
    │   └── transactions.ts       # Chaincode entrypoint names
    ├── config/index.ts           # Env config (jwt, otp, cors, fabric)
    ├── controllers/              # Thin asyncHandler-wrapped handlers
    │   ├── auth.controller.ts
    │   ├── registrar.controller.ts
    │   ├── election.controller.ts
    │   ├── candidate.controller.ts
    │   ├── vote.controller.ts
    │   ├── vote.controller.results.ts  # POST /elections/:id/results
    │   ├── blockchain.controller.ts
    │   └── audit.controller.ts
    ├── crypto/
    │   ├── password.ts           # bcrypt hash/compare
    │   ├── otp.ts                # 6-digit generate; HMAC-SHA256 hashCode/compareCode (peppered)
    │   └── jwt.ts                # sign/verify; payload { userId, role, email } ONLY
    ├── middleware/
    │   ├── jwt.middleware.ts     # authenticate(): Bearer verify, attaches req.user
    │   ├── rbac.middleware.ts    # authorize(...roles): 403; after authenticate
    │   ├── rateLimiter.ts        # global 100/15min; otp 5/min on send-otp + verify-otp
    │   ├── security.ts           # helmet + cors
    │   ├── validate.middleware.ts# Zod validation → 400 envelope
    │   └── errorHandler.ts       # ApiError class + centralized handler
    ├── repositories/
    │   ├── user.repository.ts
    │   ├── aadhaar.repository.ts # read-only MockAadhaar access
    │   ├── voter.repository.ts   # VoterProfile + VoterEligibility
    │   ├── otp.repository.ts
    │   ├── election.repository.ts
    │   └── vote.repository.ts    # credentials, ballots, blockchain txs, tally
    ├── routes/
    │   ├── auth.routes.ts
    │   ├── registrar.routes.ts
    │   ├── election.routes.ts
    │   ├── vote.routes.ts
    │   ├── blockchain.routes.ts
    │   └── audit.routes.ts
    ├── services/
    │   ├── auth.service.ts       # register/sendOtp/login/verifyOtp/logout/me
    │   ├── registrar.service.ts  # Aadhaar checks (18+, alive, duplicate) + voter creation
    │   ├── election.service.ts   # DRAFT→PUBLISHED→ACTIVE→CLOSED→RESULTS transitions
    │   ├── candidate.service.ts
    │   ├── vote.service.ts       # credential issuance + ATOMIC vote transaction + results
    │   └── audit.service.ts      # generic logEvent() — used by every module
    ├── types/                    # (reserved)
    ├── utils/
    │   ├── logger.ts             # Pino
    │   ├── prisma.ts             # Prisma client singleton
    │   ├── response.ts           # ok()/fail() envelopes
    │   └── asyncHandler.ts       # async error forwarding
    └── validators/               # auth, registrar, election, vote Zod schemas
```
