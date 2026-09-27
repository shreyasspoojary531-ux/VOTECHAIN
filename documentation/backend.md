# Backend

Express + TypeScript + Prisma (PostgreSQL) · JWT auth · RBAC · Zod · Pino · Hyperledger Fabric abstraction.

## Commands

```bash
cd backend
npm install
npm run dev              # ts-node-dev, hot reload (src/server.ts)
npm run build            # rimraf dist && tsc
npm start                # node dist/server.js
npx tsc --noEmit         # typecheck
npm run prisma:generate  # prisma generate
npm run prisma:migrate   # prisma migrate dev
npm run prisma:seed      # prisma db seed (50 Aadhaar, admin, registrar, auditor, 10 voters)
```

## Entry points

- `src/app.ts` — middleware pipeline (helmet, cors, rate-limit, pino-http) and route mounting.
- `src/server.ts` — listen + graceful shutdown.
- `src/config/index.ts` — env validation; fails fast if `DATABASE_URL` or `JWT_SECRET` is missing.

## Module map

| Concern            | Files                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| Auth & OTP         | `crypto/otp.ts`, `repositories/user.repository.ts`, `repositories/otp.repository.ts`, `services/auth.service.ts`, `controllers/auth.controller.ts`, `validators/auth.validator.ts`, `routes/auth.routes.ts` |
| Registrar          | `repositories/aadhaar.repository.ts`, `repositories/voter.repository.ts`, `services/registrar.service.ts`, `controllers/registrar.controller.ts`, `validators/registrar.validator.ts`, `routes/registrar.routes.ts`, `routes/registrar.summary.routes.ts` |
| Elections          | `repositories/election.repository.ts`, `repositories/candidate.repository.ts`, `services/election.service.ts`, `controllers/election.controller.ts`, `validators/election.validator.ts`, `routes/election.routes.ts`, `routes/candidate.routes.ts` |
| Voting             | `repositories/credential.repository.ts`, `repositories/voting.repository.ts`, `services/voting.service.ts`, `controllers/voting.controller.ts`, `validators/voting.validator.ts`, `routes/voting.routes.ts` |
| Blockchain         | `blockchain/*` (see blockchain.md), `repositories/blockchain.repository.ts`, `services/blockchain.service.ts`, `controllers/blockchain.controller.ts`, `validators/blockchain.validator.ts`, `routes/blockchain.routes.ts` |
| Audit              | `repositories/audit.repository.ts`, `services/audit.service.ts`, `controllers/audit.controller.ts`, `validators/audit.validator.ts`, `routes/audit.routes.ts` |
| Cross-cutting      | `middleware/auth.middleware.ts` (JWT + `requireRole` RBAC), `middleware/validate.middleware.ts` (Zod), `middleware/errorHandler.ts` (`AppError` + centralized handler), `middleware/notFound.ts`, `utils/logger.ts` (Pino), `utils/prisma.ts` |

## Adding a feature (convention)

1. Zod schema in `validators/<domain>.validator.ts`.
2. Prisma access in `repositories/<domain>.repository.ts`.
3. Business rules in `services/<domain>.service.ts` — raise domain failures as `new AppError(msg, status, isOperational, code)`.
4. Controller in `controllers/<domain>.controller.ts` — wrap in try/catch, `next(err)`, respond with `{ success: true, data }`.
5. Routes in `routes/<domain>.routes.ts` — chain `authenticate`, `requireRole('…')`, `validate(...)` before the controller.
6. Mount in `src/app.ts` under `/api/v1/<domain>`.

## Environment variables

| Variable                | Default                    | Purpose                          |
| ----------------------- | -------------------------- | -------------------------------- |
| `DATABASE_URL`          | — (required)               | PostgreSQL connection string     |
| `JWT_SECRET`            | — (required)               | Session JWT signing key          |
| `JWT_EXPIRES_IN`        | `1d`                       | Session token lifetime           |
| `OTP_PEPPER`            | `dev-only-pepper-change-me`| HMAC pepper for OTP hashes       |
| `OTP_EXPIRY_MINUTES`    | `5`                        | OTP lifetime                     |
| `PORT`                  | `5000` (local runs use `8080`) | HTTP port                    |
| `NODE_ENV`              | `development`              | `devOtp` exposure gate           |
| `LOG_LEVEL`             | `info`                     | Pino level                       |
| `CORS_ORIGIN`           | `http://localhost:3000`    | Allowed browser origin           |
| `RATE_LIMIT_WINDOW_MS`  | `900000` (15 min)          | Rate limit window                |
| `RATE_LIMIT_MAX`        | `100`                      | Requests per window              |
| `FABRIC_CHANNEL`        | `votechannel`              | Ledger channel name              |
| `FABRIC_CHAINCODE`      | `votechain`                | Chaincode name                   |
| `FABRIC_NETWORK`        | `./blockchain/network`     | Network profile path             |

Never commit real `.env` files.
