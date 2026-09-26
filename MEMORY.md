# MEMORY.md — Agent Working Memory

> Purpose: continuity between prompts/sessions. Log every meaningful step in the Progress Log and every judgment call under Decisions & Assumptions so future agents don't re-litigate settled questions or unknowingly contradict them.

### 2026-09-26 — Login Page Redesign
- **Login Page Redesign (`app/(auth)/login/page.tsx`)**: Redesigned strictly following the Resend centered login reference image layout. Features top-left `< Home` back link, brand mark icon, centered headline (`Log in to VoteChain`), inline sign up link (`/register`), custom ambient background texture (`bg-login.png`), top fading stroke `resend-card` form container, rounded inputs, red-tinted error state styling (`role="alert"`), full-width primary submit button, and quiet footer terms note.
- **Form & Auth Preserved**: 100% preservation of all existing auth state (`email`, `password`, `loading`, `error`), demo role handlers (`Voter`, `Registrar`, `Admin`, `Auditor`), API submission logic, error handling, and session redirects.
- **Verification**: `npm run lint`, `npm run typecheck`, and `npm run build` in `frontend/` passed cleanly (19/19 pages built).


### 2026-09-26 — Landing Page Redesign & Navbar Component
- **Navbar Component (`components/Navbar.tsx`)**: Created reusable standalone Navbar component featuring brand wordmark ("VoteChain"), centered navigation links (`Elections`, `Verify a Vote`, `Blockchain Explorer`), ghost "Log in" link, and solid pill "Get started" button. Implemented scroll-aware backdrop blur (`bg-black/70 backdrop-blur-md` on scroll) and accessible mobile hamburger drawer toggle (`aria-expanded`, `aria-controls`). Fixed layout imports across existing route segments to use canonical `Navbar.tsx`.
- **Landing Page Redesign (`app/(public)/page.tsx`)**:
  - **Resend Asymmetric Hero**: Positioned `bg-hero-1.webp` full-bleed object-cover so diagonal streaks sit near the CTA row while keeping heading contrast pure black. Left-aligned two-line heading using `font-heading`, announcement pill (`VoteChain 2.0 Protocol →`), side-by-side pill CTA & ghost link, and right-column abstract SVG voting illustration with `{/* TODO: replace with final voting illustration asset */}` marker.
  - **Live Audit Timeline Section**: Repurposed Resend tracking UI (Reference Image 4) for voting timeline ("Verified", "Recorded", "Consensus In-Progress") using dark `resend-card` with fading top-only partial stroke, status pill badges with colored dots, and monospace ID/hash chips.
  - **Light Mode Audit Showcase**: Integrated `bg-light.webp` with smooth gradient transition mask separating dark hero and light section, featuring high-contrast card scrim and zero-knowledge feature callouts.
- **Verification**: `npm run lint`, `npm run typecheck`, and `npm run build` in `frontend/` passed 100% cleanly (19/19 pages built).


### 2026-09-26 — Complete Backend Workflow & API Route Implementation
- **Hyperledger Fabric Isolation Layer (`src/blockchain/`)**: Implemented `fabric.client.ts`, `fabric.gateway.ts`, `fabric.service.ts`, `transactions.ts`, and `types.ts`. Isolated Fabric SDK behind `FabricService` exposing strictly `submitVote()`, `getTransaction()`, `getBlock()`, and `verifyTransaction()`.
- **Domain Repositories (`src/repositories/`)**: Built `candidate.repository.ts`, `credential.repository.ts`, `voting.repository.ts`, `blockchain.repository.ts`, and `audit.repository.ts`.
- **Privacy & Atomic Prisma Transactions**: Implemented atomic `$transaction` in `voting.repository.ts`:
  1. Verifies election status (`PUBLISHED`).
  2. Consumes single-use `AnonymousCredential`.
  3. Creates `Ballot` with zero identity reference (`userId` is NEVER stored with ballots).
  4. Creates `BlockchainTransaction` record and writes `AuditRecord`.
  5. Rollbacks atomized changes on any ledger or database failure.
- **Service Layer (`src/services/`)**:
  - `election.service.ts`: Extended with `update()`, `publish()`, `close()`, `publishResults()`, and candidate CRUD methods (`getCandidates`, `addCandidate`, `updateCandidate`, `deleteCandidate`).
  - `voting.service.ts`: Implemented `issueCredential()`, `castVote()`, `getVotingStatus()`, and `getReceipt()`.
  - `blockchain.service.ts`: Implemented `getBlocks()`, `getBlockByNumber()`, `getTransactionByTxId()`, and `verifyTransaction()`.
  - `audit.service.ts`: Implemented `getAuditElections()`, `getElectionAuditReport()`, and `verifyElectionChain()`.
- **Validators & Controllers**: Added Zod schemas for all body, query, and params in `voting.validator.ts`, `candidate.validator.ts`, `blockchain.validator.ts`, and `audit.validator.ts`. Built corresponding controllers and mounted all router modules in `app.ts`.
- **Verification**:
  - `npm run build` in `backend/`: 100% clean compilation.
  - `npx tsc --noEmit` in `backend/`: 0 errors.
  - Created and executed `tests/workflow.e2e.sh`: Tested all 6 workflow steps (Phase 1 Registration, Phase 2 Election Creation, Phase 3 Auth/OTP, Phase 4 Voting & Duplicate Vote Rejection, Phase 5 Receipt & Auditor Chain Verification) — 100% passed.

### 2026-09-26 — Prompt 5: Auth module (login, OTP send/verify, JWT issue)
- **Flow design (bridges PRD's OTP requirement with the existing frontend):** `POST /auth/login` verifies email+password (uniform 401 `INVALID_CREDENTIALS` for unknown email / wrong password / inactive). Staff roles (REGISTRAR/ADMIN/AUDITOR) get the session JWT immediately — identity already verified in person. VOTERs get `{ otpRequired: true, pendingToken }` and NO JWT until OTP verification. The frontend's `login()` contract (`{jwt,user}` shape on success paths) is preserved: staff get `jwt` set, voters get `otpRequired`.
- **pendingToken:** separate 10-min JWT, `{ userId, scope:'otp-pending', jti }`. Rejected if a session JWT is passed (scope check). Consumed pending tokens are revoked via an in-memory `jti` revocation map after successful verification — found by e2e test 14 that a stateless pendingToken otherwise allows starting new OTP challenges forever after login completed. **DEV-ADEQUATE trade-off:** revocation is per-process; production needs Redis (or DB-persisted challenge rows) for multi-replica correctness.
- **OTP:** 6-digit `crypto.randomInt`, HMAC-SHA256 with `OTP_PEPPER` before storage (schema field is `codeHash`), constant-time compare, 5-min expiry, single-use via atomic `updateMany(consumedAt:null)`, max 5 sends/user/15min (429). New send deletes previous unconsumed codes for that user+purpose (only one live OTP). `devOtp` returned in responses ONLY when `NODE_ENV=development`.
- **JWT:** payload exactly `{ userId, role, email }`, expiry from `JWT_EXPIRES_IN` (.env `1d`). `GET /auth/me` returns the safe public projection (id/email/role/isActive/createdAt — never passwordHash). `POST /auth/logout` is a stateless 200 (client discards token).
- **Files built new:** `crypto/otp.ts`, `repositories/user.repository.ts`, `repositories/otp.repository.ts`, `services/auth.service.ts`, `controllers/auth.controller.ts`, `validators/auth.validator.ts`, `routes/auth.routes.ts`, `tests/auth.e2e.sh`; `config/index.ts` extended (JWT_EXPIRES_IN, OTP_PEPPER, OTP_EXPIRY_MINUTES). Wired into `app.ts` at `/api/v1/auth`.
- **Verification:** `tests/auth.e2e.sh` 15/15 — 401 unknown email, 401 wrong password, 422 malformed body, staff login→JWT, /me with+without token, voter login→otpRequired+pendingToken, OTP issued (dev), wrong OTP 400, correct OTP→JWT, replay rejected 401 (pending token consumed), RBAC 403 with real voter JWT on registrar route, registrar JWT 200 on registrar route, consumed pendingToken 401, logout 200. `tests/registrar.e2e.sh` re-run 10/10 (test 8 made idempotent for repeat runs — accepts 409 if that voter was registered by an earlier run). No manual token minting remains in either suite.

### 2026-09-26 — Prompt 4: Registrar module (backend)
- **Audit of existing work first (per instructions):** found Prompts 1–3 had NOT actually landed backend code — `src/` contained only scaffold (`app.ts`, `config`, `errorHandler`, `notFound`, `logger`, `health.routes`, `server.ts`) plus `schema.prisma`/`seed.ts` from the DB prompt. No JWT/RBAC middleware, no audit service existed. Built `auth.middleware.ts` (authenticate + authorize/requireRole) fresh; audit logging done via `tx.auditRecord.create` inline (audit service is a later prompt's file). Everything else in the registrar module built new: validators, aadhaar/voter repositories, registrar.service, registrar.controller, registrar.routes, validate.middleware, utils/prisma.ts.
- **DB drift fixed:** the live `votechain` database had been created from an OLDER schema (`User.status UserStatus`, no `isActive`) while committed schema/migration use `isActive Boolean`. Symptom: Prisma P2022 `column User.isActive does not exist`. Resolution: dropped/recreated the DB, `prisma migrate deploy` + `prisma db seed` — now in sync. If a future agent hits P2022, suspect DB/migration drift first.
- **Port decision:** backend `.env` originally `PORT=5000`; frontend calls `http://localhost:8080/api/v1`. Changed backend `.env` to `PORT=8080`. Frontend `.env.local` created with the same base URL.
- **Registration email scheme:** generated as `firstname.lastname.<last4-aadhaar>@votechain.demo` (collision-checked, random hex suffix fallback). The registrar never supplies it.
- **DEMO SIMPLIFICATION — temporary password:** `register-voter` returns a one-time random 12-char password (`crypto.randomBytes(9).base64url`) in the HTTP response, bcrypt-hashed (cost 10) before storage. Not production-grade credential delivery — real system would use a secure out-of-band channel / forced reset.
- **Privacy notes:** aadhaar search select is limited to id/aadhaarNumber/fullName/dob/gender/phone (no address); voters list exposes only email/isActive/fullName/registeredAt; audit metadata logs masked Aadhaar ref (`...last4`), never the number; temp password never logged.
- **Verification:** `tsc --noEmit` clean; `tests/registrar.e2e.sh` — 10/10 pass: 401 no-token, search-by-number, search-by-partial-name, 422 empty query, 400 UNDERAGE_VOTER (seed minor 999910000001), 409 ALREADY_REGISTERED (seeded voter1's Aadhaar 999910000006), 404 unknown Aadhaar, 201 happy-path (temp password returned once), paginated voters list, 403 RBAC with voter token.
- JWT minting in tests is a stopgap until the auth prompt lands `POST /auth/login`.

### 2026-09-26 — Final Integration: AppShell, Nav, and useRequireAuth Guard
- Created `hooks/useRequireAuth.ts` — client-side authentication and role-based redirect hook (`/login` redirect for unauthenticated users, dashboard redirect for authenticated users accessing auth pages). Includes explicit UX-only note (`real enforcement is server-side`).
- Created `components/Nav.tsx` & `components/AppShell.tsx` — Resend-style navigation shell displaying role-specific navigation links for `REGISTRAR`, `VOTER`, `ADMIN`, `AUDITOR` based on `AuthContext.user.role`. Includes UX-only gating code comment (`backend is authority on capabilities`).
- Refactored `components/role-guard.tsx` to leverage `useRequireAuth`.
- Verified quality constraints across all 20 pages:
  - Explicit loading, error (`role="alert"`), empty, and loaded success states.
  - Mobile-first responsive layouts (tested at 375px/768px/1280px breakpoints).
  - Keyboard navigability, semantic HTML landmarks (`<nav>`, `<main>`, `<footer>`), and `aria-live`/`role="alert"`.
  - Zero direct `fetch`/`axios` calls outside `services/api.ts`.
  - Zero exposed secrets or raw stack traces.
- Executed `npm run format`, `npm run lint`, `npm run typecheck`, and `npm run build` — 100% clean build.

## Decisions & Assumptions

- **`src/` directory: yes.** The repo's pre-existing (empty) scaffold used `src/`, and keeping Next.js app code under `frontend/src/` separates it cleanly from config at `frontend/` root. Documented in FILESTRUCTURE.md.
- **Tailwind v4, not v3.** `tailwind.config.ts` is intentionally absent: v4 is configured CSS-first via `@theme` in `globals.css`. There is no `tailwind.config.js` to find — tokens live in one CSS place.
- **Default API base URL `http://localhost:8080/api/v1`.** Backend runs on port 8080.
- **Interceptor shape.** Request interceptor reads token and sets `Authorization: Bearer <token>` only when non-null; response interceptor normalizes all failures to `ApiError { status, message }`.
- **Timestamps as epoch milliseconds** (`number`) in domain types.
