# API Reference

Base URL: `http://localhost:8080/api/v1` (backend `PORT` default in code is 5000; the running local config uses 8080 — set `NEXT_PUBLIC_API_BASE_URL` to match).

All responses use the envelope `{ "success": true, "data": … }`. Errors are `{ "error": { "message", "code", "status" } }` with HTTP statuses 400/401/403/404/409/422/429.

Authentication: `Authorization: Bearer <jwt>`. Roles: `REGISTRAR`, `VOTER`, `ADMIN`, `AUDITOR`.

## Health — `health.routes.ts`

| Method | Path              | Access | Description            |
| ------ | ----------------- | ------ | ---------------------- |
| GET    | `/health`         | Public | Returns `{ status: "ok" }` |

## Auth — `/auth`

| Method | Path            | Access  | Description |
| ------ | --------------- | ------- | ----------- |
| POST   | `/auth/register` | Public | Register a user (email, password, name, aadhaarNumber, role) |
| POST   | `/auth/login`    | Public | Staff roles → `{ jwt, user }`. Voters → `{ otpRequired: true, pendingToken, user }` (`devOtp` included only when `NODE_ENV=development`) |
| POST   | `/auth/send-otp` | Public (pendingToken) | Issue a 6-digit OTP (hashed, 5-min expiry, single-use, rate-limited) |
| POST   | `/auth/verify-otp` | Public (pendingToken) | Consume OTP → `{ jwt, user }`; consumed pendingTokens are revoked |
| POST   | `/auth/refresh`  | Public | Silent refresh; token from `Authorization` header or `body.token` |
| POST   | `/auth/logout`   | Public | Stateless 200 — client discards token |
| GET    | `/auth/me`       | Authenticated | Safe public projection of the current user |

## Registrar — `/registrar`

| Method | Path                  | Access     | Description |
| ------ | --------------------- | ---------- | ----------- |
| GET    | `/registrar/summary`  | REGISTRAR  | Dashboard counters: `votersRegisteredToday`, `pendingVerifications`, `totalRegistered` |
| GET    | `/registrar/aadhaar/search` | REGISTRAR | Search mock Aadhaar registry by number/partial name (no address fields) |
| POST   | `/registrar/register-voter` | REGISTRAR | Register a voter from an Aadhaar record (age gate 18+, `409 ALREADY_REGISTERED`, atomic tx + audit; one-time random password returned once in the response) |
| GET    | `/registrar/voters`   | REGISTRAR  | Paginated voters list (email, isActive, fullName, registeredAt only) |
| GET    | `/registrar/voters/:id` | REGISTRAR | Single voter detail |

## Admin — `/admin`

| Method | Path               | Access | Description |
| ------ | ------------------ | ------ | ----------- |
| GET    | `/admin/summary`   | ADMIN  | Dashboard counters from `electionRepository.adminSummary()` |

## Elections — `/elections`

| Method | Path                        | Access | Description |
| ------ | --------------------------- | ------ | ----------- |
| GET    | `/elections`                | Public | List elections (query filters via `listElectionsQuerySchema`) |
| POST   | `/elections`                | ADMIN  | Create election |
| GET    | `/elections/:id`            | Public | Election detail |
| PATCH  | `/elections/:id`            | ADMIN  | Update election |
| POST   | `/elections/:id/publish`    | ADMIN  | `DRAFT → PUBLISHED` |
| POST   | `/elections/:id/close`      | ADMIN  | `PUBLISHED → CLOSED` |
| POST   | `/elections/:id/results`    | ADMIN  | Publish results (`RESULTS_PUBLISHED`) |
| GET    | `/elections/:id/results`    | Public | Public tally |
| GET    | `/elections/:id/candidates` | Public | Candidates list |
| POST   | `/elections/:id/candidates` | ADMIN  | Add candidate (`{ name, party }`) |
| PUT    | `/elections/:id/candidates` | ADMIN  | Replace/append candidate roster (`{ candidates: [{ name, partyName }] }`) |

## Candidates — `/candidates`

| Method | Path             | Access | Description |
| ------ | ---------------- | ------ | ----------- |
| PATCH  | `/candidates/:id` | ADMIN | Update a candidate |
| DELETE | `/candidates/:id` | ADMIN | Delete a candidate |

## Voting — `/votes`

| Method | Path                     | Access        | Description |
| ------ | ------------------------ | ------------- | ----------- |
| POST   | `/votes/credential`      | VOTER         | Issue/get the anonymous credential for an election; `409 DUPLICATE_VOTE` if already used |
| POST   | `/votes`                 | VOTER         | Cast a ballot: `{ electionId, candidateId, credentialHash, encryptedPayload? }` → `{ txId, blockNumber, ballotHash, status, timestamp }` |
| GET    | `/votes/status`          | VOTER         | Eligibility / has-voted status for an election |
| GET    | `/votes/receipt/:txId`   | Public        | Verifiable vote receipt (contains no ballot contents or identity) |

## Blockchain — `/blockchain`

| Method | Path                        | Access | Description |
| ------ | --------------------------- | ------ | ----------- |
| GET    | `/blockchain/blocks`        | Public | Paginated blocks |
| GET    | `/blockchain/blocks/:number`| Public | Single block by height |
| GET    | `/blockchain/transactions/:txId` | Public | Transaction detail |
| GET    | `/blockchain/verify/:txId`  | Public | Ledger-side verification of a transaction |

## Audit — `/audit`

| Method | Path                       | Access  | Description |
| ------ | -------------------------- | ------- | ----------- |
| GET    | `/audit/elections`         | AUDITOR | Elections with audit data |
| GET    | `/audit/elections/:id`     | AUDITOR | Full audit report for an election |
| GET    | `/audit/elections/:id/verify` | AUDITOR | End-to-end chain verification for an election |

## Error codes seen in the codebase

`INVALID_CREDENTIALS`, `UNAUTHENTICATED`, `TOKEN_REQUIRED`, `UNDERAGE_VOTER`, `ALREADY_REGISTERED`, `VOTER_NOT_REGISTERED`, `DUPLICATE_VOTE`, `INVALID_CANDIDATE`, `RECEIPT_NOT_FOUND`, `RATE_LIMIT_EXCEEDED`. Zod validation failures return `422`.
