# Security

## Threat model summary

| Threat                                   | Mitigation                                                                                     |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Credential stuffing / password attacks    | bcrypt (cost 10), uniform `401 INVALID_CREDENTIALS` for unknown email / wrong password / inactive |
| OTP brute force / replay                  | 6-digit `crypto.randomInt`, HMAC-SHA256 + `OTP_PEPPER` before storage, constant-time compare, 5-min expiry, single-use atomic consumption, max 5 sends/user/15min (`429`), previous unconsumed codes deleted on new send |
| Pending-token replay after login finished | In-memory `jti` revocation map — consumed pending tokens are rejected (`401`)                    |
| Privilege escalation                      | `requireRole()` RBAC on every non-public route; role travels inside the signed JWT payload      |
| Ballot stuffing / duplicate voting        | Single-use `AnonymousCredential` consumed inside the same atomic transaction that writes the ballot |
| Vote–voter linkability                    | `Ballot` rows carry only `credentialHash`; no `userId` on ballots                                |
| Identity leakage in logs/APIs             | Aadhaar masked to `…last4` in audit metadata; registrar search selects only safe columns; temp passwords never logged |
| Common web attacks                        | `helmet` security headers, strict CORS allow-list, `express-rate-limit`, Zod validation on all inputs |
| Tampering with recorded votes             | Ballot hash committed to the append-only ledger; anyone can re-verify via `/blockchain/verify/:txId` and auditors via `/audit/elections/:id/verify` |

## Authentication flow

**Staff (Registrar/Admin/Auditor):** `POST /auth/login` → identity verified in person previously → session JWT issued immediately. JWT payload: `{ userId, role, email }`, expiry from `JWT_EXPIRES_IN`.

**Voter:** `POST /auth/login` → `{ otpRequired: true, pendingToken, user }` (no JWT yet) → `POST /auth/send-otp` → `POST /auth/verify-otp` → session JWT.

- `pendingToken` is a separate 10-minute JWT with `{ userId, scope: 'otp-pending', jti }`; a session JWT is rejected where a pending token is required (scope check).
- `GET /auth/me` returns the safe projection (id, email, role, isActive, createdAt — never `passwordHash`).
- `POST /auth/logout` is stateless; the client discards the token.

## Role-based access control

- `authenticate()` verifies the JWT and attaches `req.user`.
- `requireRole('ADMIN')` (alias `authorize()`) rejects mismatches with `403`.
- Public routes: `/health`, election browse/detail/results, candidates list, receipt lookup, blockchain explorer/verification.

## Privacy model

1. Identity is established once (Aadhaar + registrar), then stripped: eligibility → anonymous credential → ballot.
2. The credential hash is the only thread connecting a voter to a ballot, and it is single-use by database constraint inside an atomic transaction.
3. Receipts expose `txId`, `ballotHash`, status and timestamps — never candidate choice or identity.
4. Zero-knowledge-style posture for the UI: no full Aadhaar anywhere in the frontend (last-4 only).

## Known security limitations

- **Per-process pending-token revocation** — production needs Redis or DB-persisted challenge rows for multi-replica correctness.
- **Demo credential delivery** — `register-voter` returns a one-time password in the HTTP response; a real system requires a secure out-of-band channel + forced reset.
- **`devOtp`** is returned in login/OTP responses only when `NODE_ENV=development`; never enable in production.
- **Default secrets** — `OTP_PEPPER` has a dev fallback; always set strong `JWT_SECRET` / `OTP_PEPPER` values outside development.
- Ledger privacy currently depends on the abstraction layer's mock/simulated mode — see blockchain.md and limitations.md.
