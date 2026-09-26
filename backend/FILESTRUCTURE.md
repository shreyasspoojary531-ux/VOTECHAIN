# FILESTRUCTURE.md

```
backend/
├── AGENTS.md                     # Working agreement for agents (conventions, layering)
├── PRD.md                        # Phase checklist
├── MEMORY.md                     # Cross-prompt memory (decisions, seeds, limits)
├── FILESTRUCTURE.md              # This file
├── .env                          # DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, OTP_PEPPER, PORT
├── .gitignore
├── package.json                  # Scripts: dev, build, typecheck, prisma:push, seed
├── tsconfig.json
├── prisma/
│   ├── schema.prisma             # User, OTPCode, AuditRecord (SQLite)
│   ├── dev.db                    # SQLite database (gitignored)
│   └── seed.ts                   # Seeds active admin + registrar
└── src/
    ├── app.ts                    # Express app; /api/v1/auth + global rate limiter
    ├── server.ts                 # Entrypoint
    ├── config/index.ts           # Env config (jwt secret, otp pepper/ttl)
    ├── crypto/
    │   ├── password.ts           # bcrypt hash/compare
    │   ├── otp.ts                # 6-digit generate; HMAC-SHA256 hashCode/compareCode
    │   └── jwt.ts                # sign/verify, payload { userId, role, sessionId }
    ├── controllers/
    │   └── auth.controller.ts    # Thin handlers → auth.service
    ├── middleware/
    │   ├── jwt.middleware.ts     # Bearer verification; attaches req.user
    │   ├── rbac.middleware.ts    # requireRole(...roles); 403; runs after JWT
    │   ├── rateLimiter.ts        # globalLimiter (100/15min) + otpLimiter (5/min)
    │   └── validate.middleware.ts# Generic Zod body validation
    ├── repositories/
    │   ├── user.repository.ts    # createUser, findByEmail, findById, activateUser
    │   └── otp.repository.ts     # createOtp, findLatestValid, markConsumed, invalidatePrior
    ├── routes/
    │   └── auth.routes.ts        # 5 auth endpoints; OTP limiter on send-otp/verify-otp
    ├── services/
    │   ├── auth.service.ts       # Business logic: register/sendOtp/login/verifyOtp/me
    │   └── audit.service.ts      # Generic logEvent() — shared by all later modules
    ├── types/                    # (empty, reserved)
    ├── utils/
    │   ├── logger.ts             # Pino instance
    │   └── prisma.ts             # Prisma client singleton
    ├── validators/
    │   └── auth.validator.ts     # Zod schemas for all auth request bodies
    └── blockchain/               # (empty, reserved — ONLY this dir may reference Fabric)
```

## Planned (later prompts)
- `src/routes/` + `src/controllers/` + `src/services/`: registrar, election, voting, blockchain modules
- `src/blockchain/`: Hyperledger Fabric integration
