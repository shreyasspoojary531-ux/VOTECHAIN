# PRD.md — VoteChain

## Overview

A privacy-preserving digital voting system prototype. Demonstrates: authentication → voter eligibility → anonymous voting credential → ballot creation → ballot encryption → ballot hashing → blockchain transaction → confirmation → verification → audit/results dashboard.

Uses only fake/demo voter and Aadhaar data — never real Aadhaar information, anywhere.

Core privacy rule: voter identity is always kept separate from ballot data, at every layer (data models, APIs, blockchain records).

## Current Focus

**Phase 1 — Frontend only.** Phases 2 and 3 are scoped below for later; do not build them yet.

## Checkpoints

### Phase 1 — Frontend (current)
- [ ] Project scaffold: Next.js (TypeScript) + Tailwind CSS, App Router
- [ ] Route/page skeleton for all voter and admin routes (Next.js file-based routing)
- [ ] Mock data/service layer (shaped like the future real API, swappable later)
- [ ] Login screen — demo identity input + eligibility result
- [ ] Elections list screen
- [ ] Election detail screen — info, candidates, status
- [ ] Ballot screen — candidate selection + review
- [ ] Confirmation screen — transaction ID, ballot hash, blockchain status
- [ ] Verification screen — transaction ID, block number, hash comparison, clear VERIFIED/FAILED result
- [ ] Admin dashboard — eligible voters, votes cast, participation, blockchain status, candidate results
- [ ] Admin: elections management UI
- [ ] Admin: candidates management UI
- [ ] Admin: voters management UI
- [ ] Admin: results UI (Recharts — totals, candidate results, participation)
- [ ] Admin: audit log — chronological event timeline
- [ ] Admin: blockchain explorer — block list, block detail (prev hash, data hash, tx count), transaction list, transaction detail
- [ ] "Vote Journey" visual (Identity Verified → Eligibility → Credential → Encrypted Ballot → Ballot Hash → Blockchain Transaction → Block → Verified)
- [ ] Blockchain chain visual — sequential blocks, clickable to show block/transaction detail
- [ ] Privacy architecture visual — Identity Layer / Anonymous Voting Layer / Blockchain Layer, visually separated

### Phase 2 — Backend (not started)
- [x] Express (TypeScript) + PostgreSQL (Prisma) setup; data models: MockAadhaar, User, VoterProfile, VoterEligibility, OTPCode, Election, Candidate, AnonymousCredential, Ballot, BlockchainTransaction, AuditRecord + migration & seed data
- [ ] Auth APIs (`/api/auth/login`, `/logout`, `/me`) + JWT (no ballot/candidate data in token)
- [ ] Role-based authorization middleware (VOTER, ADMIN, AUDITOR)
- [ ] Election APIs (CRUD, admin-only mutations)
- [ ] Candidate APIs
- [ ] Voter APIs (never leak MockAadhaar details unnecessarily)
- [ ] Voting credential APIs — generate, hash, store only the hash
- [ ] Vote casting API — validate credential → encrypt ballot → SHA-256 hash → submit to blockchain service → store metadata → mark credential used → audit log
- [ ] Vote verification APIs — compare stored vs blockchain hash, return VERIFIED/FAILED
- [ ] Results API — aggregate only, no voter identity exposed
- [ ] Audit APIs — full event trail (auth, credential gen, ballot creation/hashing, blockchain submit/confirm, credential use, verification)
- [ ] Blockchain service abstraction: `BlockchainService` → `MockBlockchainService` (dev default)
- [ ] Blockchain explorer APIs (blocks, transactions, verify) — ADMIN/AUDITOR only, no PII

### Phase 3 — Blockchain / Hyperledger Fabric (not started)
- [ ] Fabric network setup (Gateway/SDK)
- [ ] Chaincode — records only non-identifying data (election ID, ballot hash, timestamp, metadata)
- [ ] `FabricBlockchainService` implementing the same interface as the mock, swapped in via config only — no controller/business-logic changes required
- [ ] End-to-end verification against the real Fabric ledger

## Non-negotiable Constraints

- No real Aadhaar/voter PII anywhere in the blockchain layer or blockchain-facing APIs.
- Voter identity (voter ID, Aadhaar number, name, email, phone, address) never touches: JWT payload, blockchain transaction, blockchain explorer output.
- Layering (backend phases): routes → controllers → services → repositories → database/blockchain. No business logic in routes.
- Swapping `MockBlockchainService` for `FabricBlockchainService` must require config changes only — never controller or voting-logic changes.