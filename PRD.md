# PRD — Blockchain-Secured E-Voting Platform

> Status legend: ☐ not started · ◐ in progress · ☑ done
> Frontend scope only unless a line says otherwise.

## 1. Product summary

A verifiable electronic voting platform with four roles (Registrar, Voter, Admin, Auditor). Voter privacy is enforced cryptographically (Aadhaar-based identity → OTP verification → ballot cast → receipt); integrity is enforced by an append-only blockchain that anyone may inspect.

## 2. Feature checklist

### Foundation
- [x] Project scaffold (Next.js TS + Tailwind v4 + ESLint, npm)
- [x] Route/page skeleton (20 routes, placeholder pages)
- [x] Centralized API client (axios instance, env base URL, JWT + error interceptor stubs)
- [ ] Typed service layer wired to real endpoints (stubs exist in `services/*.api.ts`)
- [ ] Shared UI primitives (buttons, inputs, cards, hairline borders)
- [ ] Role-based navigation shell (REGISTRAR / VOTER / ADMIN / AUDITOR)

### Auth & identity
- [x] Register page (`/register`) → POST /api/v1/auth/register
- [x] Login page (`/login`) → POST /api/v1/auth/login
- [x] OTP send + verify flow (`/otp`) → POST /api/v1/auth/send-otp, /verify-otp
- [x] JWT session handling (storage, refresh, 401 handling)
- [ ] Role guards for /registrar, /admin, /audit segments

### Registrar
- [ ] Dashboard (`/registrar/dashboard`)
- [ ] Aadhaar search (`/registrar/aadhaar-search`) → GET /api/v1/registrar/aadhaar/search
- [ ] Register voter (`/registrar/register-voter`) → POST /api/v1/registrar/register-voter
- [ ] Voters list (`/registrar/voters`)

### Admin
- [ ] Dashboard (`/admin/dashboard`)
- [ ] Elections list (`/admin/elections`) → GET /api/v1/elections
- [ ] Create election (`/admin/create-election`) → POST /api/v1/elections
- [ ] Candidates management (`/admin/candidates`)
- [ ] Results (`/admin/results`)

### Voter
- [ ] Elections browse (`/elections`)
- [ ] Vote journey (`/vote`) — cast ballot → POST /api/v1/votes (includes Vote Journey visual)
- [ ] Receipt / verification (`/verification`) → GET /api/v1/votes/receipt/:txId

### Blockchain
- [ ] Explorer (`/blockchain/explorer`) → GET /api/v1/blockchain/blocks
- [ ] Transaction detail (`/blockchain/transaction`) → GET /api/v1/blockchain/transactions/:txId
- [ ] Block detail (`/blockchain/block`)
- [ ] Chain visual component (block-linkage visualization)

### Audit
- [ ] Audit dashboard (`/audit/dashboard`) → GET /api/v1/audit/elections/:id

### Visual architecture pieces (DESIGN.md hero sections)
- [ ] Vote Journey visual
- [ ] Blockchain chain visual
- [ ] Privacy architecture visual

## 3. Non-goals (for the frontend)

- Implementing backend endpoints, consensus, or cryptography.
- Storing or displaying full Aadhaar numbers anywhere in the UI (last-4 only).
- Exposing ballot contents; only receipts and public ledger data.
