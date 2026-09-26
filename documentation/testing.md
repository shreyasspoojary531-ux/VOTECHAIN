# Testing

## E2E suites (bash, run against a live backend)

| Suite                          | Covers |
| ------------------------------ | ------ |
| `backend/tests/auth.e2e.sh`    | 15 cases: 401 unknown email, 401 wrong password, 422 malformed body, staff login→JWT, `/me` with/without token, voter login→`otpRequired`+`pendingToken`, OTP issue (dev), wrong OTP 400, correct OTP→JWT, pending-token replay 401, RBAC 403 with voter token on registrar route, registrar JWT 200, consumed pendingToken 401, logout 200 |
| `backend/tests/registrar.e2e.sh` | 10 cases: 401 no-token, search by number/partial name, 422 empty query, 400 `UNDERAGE_VOTER` (seed minor `999910000001`), 409 `ALREADY_REGISTERED` (Aadhaar `999910000006`), 404 unknown Aadhaar, 201 happy path (temp password once), paginated voters list, RBAC 403 |
| `backend/tests/workflow.e2e.sh`  | Full business flow Phases 1–5: registration → election creation → auth/OTP → voting & duplicate-vote rejection → receipt & auditor chain verification |

```bash
cd backend
npm run dev                # terminal 1
bash tests/auth.e2e.sh     # terminal 2 (repeat for the other suites)
```

The suites mint tokens through the real login flow — no manual token pasting.

## Type & build verification

```bash
cd backend  && npx tsc --noEmit && npm run build
cd frontend && npm run lint && npm run typecheck && npm run build
```

## Seeded test data

`npm run prisma:seed` (in `backend/`) loads 50 mock Aadhaar records (including known minors for the age gate), an admin, a registrar, an auditor, and 10 voters — the E2E suites depend on these fixtures.

## Manual smoke check

1. `GET /api/v1/health` → `{ "status": "ok" }`
2. Staff login → hit `/auth/me` with the JWT.
3. Voter login → OTP flow → `POST /votes/credential` → `POST /votes` → `GET /votes/receipt/:txId`.
4. Auditor → `GET /audit/elections/:id/verify`.
