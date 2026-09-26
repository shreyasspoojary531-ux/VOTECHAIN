# MEMORY.md — Agent Working Memory

> Purpose: continuity between prompts/sessions. Log every meaningful step in the Progress Log and every judgment call under Decisions & Assumptions so future agents don't re-litigate settled questions or unknowingly contradict them.

### 2026-09-26 — Role-Based Navigation & Guards
- Built `components/navbar.tsx` — responsive navigation shell with role-specific link routing and user display (supports REGISTRAR, VOTER, ADMIN, AUDITOR).
- Built `components/role-guard.tsx` — client-side route protection checking `isAuthenticated` and `user.role`, rendering "Access Denied" or redirecting to `/login`.
- Attached `RoleGuard` + `Navbar` to role-specific layouts (`/registrar/layout.tsx`, `/admin/layout.tsx`, `/audit/layout.tsx`).
- Attached `Navbar` (without guard) to voter-facing and public layouts (`/blockchain/layout.tsx`, `/elections/layout.tsx`, `/vote/layout.tsx`, `/verification/layout.tsx`).
- Verified `npm run lint`, `npm run typecheck`, and `npm run build` pass cleanly.

### 2026-09-26 — Auditor Role Module (`services/audit.api.ts` & `/audit/dashboard` page)
- Replaced scaffold `services/audit.api.ts` stub with real `getElectionAudit(electionId)` → `GET /api/v1/audit/elections/:id`, using `apiClient`. Only the one function specified in the API contract; no invented endpoints.
- Built `app/audit/dashboard/page.tsx` — read-only oversight view:
  - Election dropdown populated by reusing `getElections()` from `election.api.ts` (no duplication).
  - On selection, fetches and renders `ElectionAuditReport` defensively (only fields defined in the type).
  - Chain integrity verification banner (✓ verified / ✗ failed).
  - Vote count reconciliation stat cards (total, valid, invalid, last audited).
  - Discrepancies list rendered only when the array is non-empty.
  - States: idle ("select an election"), loading skeleton, error with retry, loaded report.
  - Quick link to Blockchain Explorer for cross-reference.
- No mutating actions — entire module is read-only.
- Verified `npm run lint`, `npm run typecheck`, and `npm run build` pass cleanly.

### 2026-09-26 — Blockchain Transparency Module (`services/blockchain.api.ts` & `/blockchain/*` pages)
- Implemented `services/blockchain.api.ts` (`getBlocks`, `getBlockById`, `getTransaction`, `listBlocks`) using `apiClient`.
- Built Resend-style read-only transparency pages:
  - `app/blockchain/explorer/page.tsx`: Recent blocks list (height, mono hash, tx count, timestamp), loading skeleton, empty state, error retry.
  - `app/blockchain/block/[blockId]/page.tsx`: Block detail displaying block hash, previous hash, timestamp, and list of transaction links.
  - `app/blockchain/transaction/[txId]/page.tsx`: Transaction detail displaying `txId`, type (`VOTE`, `REGISTRATION`, `ELECTION_CREATE`, `RESULT_COMMIT`), block reference, and opaque payload hash. Reinforces immutable ledger commitment while guaranteeing voter secrecy.
- Verified `npm run lint`, `npm run typecheck`, `npm run format`, and `npm run build` pass cleanly with zero warnings or errors.

### 2026-09-26 — Admin Role Module (`services/election.api.ts` extensions & `/admin/*` pages)
- Extended `services/election.api.ts` with `getAdminSummary`, `getElectionResults`, and `updateElectionCandidates` (annotated with `// TODO` comments where backend contracts are pending).
- Built Resend-style Admin module pages:
  - `app/admin/dashboard/page.tsx`: System overview cards (active elections, total votes cast, total elections count), loading skeleton, error retry, quick navigation cards.
  - `app/admin/elections/page.tsx`: Table of all elections from `getElections()` with status, startsAt/endsAt dates, and action link to view results per election.
  - `app/admin/create-election/page.tsx`: Form for `CreateElectionRequest` with title, description, start/end date-time pickers, and dynamic candidate roster builder. Redirects to `/admin/elections` on creation.
  - `app/admin/candidates/page.tsx`: Per-election candidate inspection and management interface with election selector and inline candidate addition.
  - `app/admin/results/page.tsx`: Election results console with selectable election dropdown (query param `?electionId=...` support wrapped in `<Suspense>`) and high-contrast minimal candidate vote percentage bars.
- Verified `npm run lint`, `npm run typecheck`, `npm run format`, and `npm run build` pass cleanly.

### 2026-09-26 — Core Election + Voting Module (`services/election.api.ts`, `services/voting.api.ts`, and voting pages)
- Implemented `services/election.api.ts` (`getElections`, `getElectionById`, `createElection`) and `services/voting.api.ts` (`castVote`, `getReceipt`) using `apiClient`.
- Built citizen voting journey pages:
  - `app/elections/page.tsx`: Available elections cards with status badges, dates, view/vote actions, loading skeleton, empty state, error state.
  - `app/elections/[id]/page.tsx`: Election details, candidate cards, polls timeline, and vote CTA.
  - `app/vote/[electionId]/page.tsx`: Multi-step voting flow (`SELECT` candidate radio group -> `REVIEW` explicit confirmation -> `SUBMITTING` ledger commit state). On success redirects to `/verification/[txId]`. On error permits manual retry.
  - `app/verification/[txId]/page.tsx`: End-to-end vote receipt verification screen displaying `txId`, `receiptHash`, timestamp, block hash while preserving ballot secrecy. Deep-links to `/blockchain/transaction/[txId]`.
- Verified `npm run lint`, `npm run typecheck`, `npm run format`, and `npm run build` pass cleanly with zero warnings or errors.

### 2026-09-26 — Registrar Role Module (`services/registration.api.ts` & `/registrar/*` pages)
- Implemented `services/registration.api.ts` (`searchAadhaar`, `registerVoter`, `listRegisteredVoters`, `getRegistrarSummary`) using `apiClient`.
- Built Resend-style Registrar module pages:
  - `app/registrar/dashboard/page.tsx`: Summary cards (voters registered today, pending actions, total registered), loading skeleton, error handling, quick action cards.
  - `app/registrar/aadhaar-search/page.tsx`: Search form, results table with "Register this voter" action per row deep-linking with query parameters (`?aadhaarNumber=...&name=...`), default/searching/empty/error states.
  - `app/registrar/register-voter/page.tsx`: Enrolment form prefilled from query params, client validation, loading/error/success states with created voter ID confirmation card.
  - `app/registrar/voters/page.tsx`: Paginated, searchable list of registered voters with pagination controls, loading skeleton, empty state, error banner.
- Verified `npm run lint`, `npm run typecheck`, `npm run format`, and `npm run build` pass cleanly with static page generation.

### 2026-09-26 — Auth Services, AuthContext, and Resend-Style Auth Pages (`/login`, `/register`, `/otp`)
- Implemented `services/auth.api.ts` (`register`, `login`, `logout`) using `apiClient`.
- Implemented `services/otp.api.ts` (`sendOtp`, `verifyOtp`) using `apiClient`.
- Created `context/AuthContext.tsx` providing `{ user, token, isAuthenticated, login, logout, loading }` with stored token hydration on mount, and wrapped `app/layout.tsx` with `<AuthProvider>`.
- Built Resend-style minimal UI pages:
  - `app/(auth)/login/page.tsx`: Credentials form, loading spinner, inline error display, role-based dashboard redirection upon successful login.
  - `app/(auth)/register/page.tsx`: Form matching `RegisterRequest`, client-side validation (required fields, email format, 12-digit Aadhaar), routing to `/otp` upon registration for multi-factor verification.
  - `app/(auth)/otp/page.tsx`: 6-digit segmented OTP input with auto-advance, 60s cooldown timer for resend action, role-based redirection upon verification.
- Verified `npm run lint`, `npm run typecheck`, `npm run format`, and `npm run build` pass cleanly.

### 2026-09-26 — Domain Types & Centralized Fetch API Client (`apiClient`)
- Defined complete domain model TypeScript interfaces in `frontend/src/types/index.ts`:
  - Auth: `RegisterRequest`, `LoginRequest`, `LoginResponse`, `SendOtpRequest`, `VerifyOtpRequest`, `VerifyOtpResponse`
  - User/Role: `Role`, `User`
  - Registrar: `AadhaarSearchQuery`, `AadhaarSearchResult`, `RegisterVoterRequest`, `RegisterVoterResponse`
  - Election: `Election`, `CreateElectionRequest`, `Candidate`
  - Voting: `CastVoteRequest`, `CastVoteResponse`, `VoteReceipt`
  - Blockchain: `Block`, `Transaction`
  - Audit: `ElectionAuditReport`
- Created token store helper `frontend/src/lib/auth-token.ts` with `getToken()`, `setToken()`, `clearToken()`.
- Implemented single centralized API client `apiClient<T>(path, options)` in `frontend/src/services/api.ts` using `fetch`:
  - Base URL prefixing with `process.env.NEXT_PUBLIC_API_BASE_URL`
  - Automatic `Authorization: Bearer <token>` attachment
  - `Content-Type: application/json` default
  - Error handling normalizing failures into custom `ApiError` class with `status`, `message`, `code`
  - Support for `GET`, `POST`, `PUT`, `DELETE` methods with typed generics

### 2026-09-26 — Next.js 15 project setup with Prettier, ESLint 9, Tailwind v4 design tokens, and updated App Router structure
- Installed `prettier` and `eslint-config-prettier` in `frontend/`.
- Configured `.prettierrc` with requested defaults (`semi: true`, `singleQuote: true`, `trailingComma: 'all'`, `printWidth: 100`).
- Updated `eslint.config.mjs` to integrate `eslint-config-prettier`.
- Added `"format": "prettier --write ."` script to `package.json`.
- Created `.env.local.example` with `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1` and updated `.env.example`.
- Configured Tailwind v4 CSS-first design tokens in `globals.css` with color scale (`canvas`, `surface`, `hairline`, `ink`, `accent`, `success`, `danger`, `warning`), custom border radius (`md`, `lg`, `full`), and font variables (`--font-sans`, `--font-mono`, `--font-display`).
- Reorganized `frontend/src/app/` structure:
  - `(public)/page.tsx` -> `/`
  - `(auth)/login/page.tsx` -> `/login`
  - `(auth)/register/page.tsx` -> `/register`
  - `(auth)/otp/page.tsx` -> `/otp`
  - `registrar/*` (`dashboard`, `aadhaar-search`, `register-voter`, `voters`)
  - `admin/*` (`dashboard`, `elections`, `create-election`, `candidates`, `results`)
  - `elections/page.tsx` & `elections/[id]/page.tsx`
  - `vote/[electionId]/page.tsx`
  - `verification/[txId]/page.tsx`
  - `blockchain/*` (`explorer`, `transaction/[txId]`, `block/[blockId]`)
  - `audit/dashboard/page.tsx`
- Scaffolded non-app directory structure under `frontend/src/`: `services/`, `types/`, `lib/`, `components/`, `hooks/`, `context/`.
- Verified `npm run lint`, `npm run typecheck`, `npm run format`, and `npm run build` succeed cleanly.

### 2026-09-26 — Scaffold + route skeleton + API client foundation (frontend branch)
- Reinitialized the empty `frontend/` scaffold (all pre-existing files were 0 bytes; nothing of value was lost). Stack: Next.js 15 App Router + TypeScript strict, Tailwind CSS v4 (CSS-first `@theme`), ESLint 9 flat config, axios. Package manager: npm (Node v25).
- Created all 20 required routes with placeholder pages rendering a shared `ComingSoon` component (`/`, `/login`, `/register`, `/otp`, 4× `/registrar/*`, 5× `/admin/*`, `/elections`, `/vote`, `/verification`, 3× `/blockchain/*`, `/audit/dashboard`). Segment layouts (`layout.tsx`) added for `/registrar`, `/admin`, `/blockchain`, `/audit` as guard/chrome attachment points.
- Centralized API client: `src/services/api.ts` — axios instance, `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8000`, documented in `.env.example`), request interceptor with `getToken()` JWT stub (always null for now), response interceptor normalizing errors to a typed `ApiError { status, message }`.
- Seven typed service files locked to the endpoint contract: `auth.api.ts`, `otp.api.ts`, `registration.api.ts`, `election.api.ts`, `voting.api.ts`, `blockchain.api.ts`, `audit.api.ts` — real signatures, throwing `notImplemented` bodies, param/result interfaces co-located.
- Shared domain types in `src/types/index.ts`: `Role` union, `Voter`, `Candidate`, `Election`, `Vote`, `BlockchainTransaction`, `Block`, `AuditEvent`, plus `ElectionStatus` and a `Paginated<T>` envelope.
- Tailwind v4 theme tokens in `src/app/globals.css` per DESIGN.md: canvas/surface colors, hairline border scale, ink text scale, semantic colors, radius (md 8px / lg 12px / full), three-font system (Inter/Geist Mono/Fraunces) wired via next/font CSS variables. True-black canvas applied in root layout.
- Verification: `eslint` clean, `tsc --noEmit` clean, `next build` succeeds with all 20 routes prerendering statically; production server smoke-tested over HTTP (routes 200, theme tokens and font variables present in served CSS/HTML). Server was stopped after the test.

## Decisions & Assumptions

- **`src/` directory: yes.** The repo's pre-existing (empty) scaffold used `src/`, and keeping Next.js app code under `frontend/src/` separates it cleanly from config at `frontend/` root. Documented in FILESTRUCTURE.md.
- **Tailwind v4, not v3.** `tailwind.config.ts` is intentionally absent: v4 is configured CSS-first via `@theme` in `globals.css`. There is no `tailwind.config.js` to find — tokens live in one CSS place.
- **Default API base URL `http://localhost:8000`.** The backend port is not yet fixed anywhere in the repo (backend package.json empty); the env var overrides this, and `.env.example` documents it. If the backend lands on a different port, change `.env.example` and the fallback in `api.ts`.
- **Interceptor shape.** Request interceptor reads a `getToken()` stub that returns null (no auth yet) and sets `Authorization: Bearer <token>` only when non-null; response interceptor normalizes all failures to `ApiError { status, message }` so UI code never touches raw AxiosError. Refresh-token handling is deliberately absent until the auth prompt.
- **Service bodies throw `notImplemented`.** Chosen over typed mock returns so that accidental UI wiring against a stub fails loudly instead of silently rendering fake data.
- **Extra typed stubs.** `getVoteReceipt(txId)` added (it is in the endpoint contract) even though its page checkbox is separate; `Paginated<T>` envelope assumed for list endpoints (registrar search, blocks, elections) rather than bare arrays — contract docs are empty, so this is an assumption, not a fact.
- **Timestamps as epoch milliseconds** (`number`) in domain types, pending backend confirmation.
- **Removed pre-existing empty placeholders** (`middleware.ts`, `services/verification.api.ts`, empty `config|features|hooks|utils` dirs, six empty component dirs with `.gitkeep`s) so the tree contains only real files; feature dirs get recreated when content arrives. Also removed stray empty routes `/verify`, `/admin`, `/audit`, `/blockchain` index pages that weren't in the route contract.
- **Four root docs created fresh** (AGENTS/PRD/MEMORY/FILESTRUCTURE/DESIGN): none existed in the repo despite the task referencing them. PRD checklist content is inferred from the route map and endpoint contract in the task prompt.
- **Layouts-only approach to shared chrome:** segment layouts exist but render children unchanged — role guards intentionally deferred to the auth prompt to avoid inventing session semantics now.
