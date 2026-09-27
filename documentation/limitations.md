# Limitations & Known Gaps

Honest inventory of what is mocked, simplified, or deferred. Read before relying on any guarantee.

## Ledger

- The Fabric abstraction layer (`backend/src/blockchain/`) currently operates in a **simulated/mock mode** — blocks, transactions, and verification run without a real Hyperledger Fabric network. Real deployment requires network bootstrap, chaincode deployment, and MSP/identity management.
- "Append-only" guarantees are as strong as the storage behind the abstraction; with the mock, that is ordinary PostgreSQL.

## Authentication

- **Pending-token revocation is per-process** (in-memory `jti` map). Multi-replica production needs Redis or DB-persisted challenge rows.
- No refresh-token rotation or server-side session revocation; logout is client-side token discard.

## Voter registration

- `register-voter` returns the one-time password in the HTTP response — acceptable for demo only; production requires a secure out-of-band delivery channel and forced password reset.
- Aadhaar is a **mock registry** (`MockAadhaar` model, seeded records); no real UIDAI integration or liveness/face verification.

## OTP delivery

- OTPs are not actually delivered — `devOtp` is returned in API responses when `NODE_ENV=development`. A production build needs an SMS/email gateway.

## Privacy

- `encryptedPayload` on ballots is a placeholder unless a caller supplies one; end-to-end ballot encryption (e.g. homomorphic or mixnet tallying) is not implemented. Result tallies are computed from plaintext candidate counts in the database.
- The system separates identity from ballots at the application/database layer; it is not a cryptographically anonymous scheme (no blind signatures/ZK credentials).

## Operations

- No CI pipelines yet (`.github/` exists but workflows are not part of the verified flow).
- Single PostgreSQL instance assumed; no replication/failover story.
- `scripts/*.sh` (`setup`, `dev`, `test`, `deploy`) are placeholders for future orchestration.
