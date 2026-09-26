#!/bin/bash
# End-to-end test for the Auth module (login, OTP send/verify, JWT, me, logout).
# Uses ONLY the public API — no token minting, proving the flow works end-to-end.

set -u
export DATABASE_URL="postgresql://votechain:password@localhost:5432/votechain?schema=public"
cd "$(dirname "$0")/.."

PASS=0
FAIL=0

check() {
  local name="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    echo "PASS: $name (HTTP $actual)"
    PASS=$((PASS+1))
  else
    echo "FAIL: $name — expected $expected, got $actual"
    FAIL=$((FAIL+1))
  fi
}

extract() { node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);console.log(eval('j'+process.argv[1])??'')}catch{console.log('')}})" "$1"; }

# --- start backend ---
fuser -k 8080/tcp 2>/dev/null
sleep 1
(npx ts-node-dev --respawn --transpile-only src/server.ts > /tmp/backend-auth-test.log 2>&1 &)
for i in $(seq 1 20); do
  curl -s --max-time 2 http://localhost:8080/api/v1/health | grep -q ok && break
  sleep 1
done
echo "backend: $(curl -s http://localhost:8080/api/v1/health)"
BASE="http://localhost:8080/api/v1/auth"

echo
echo "=== 1. Login with unknown email -> 401 ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/login -H "Content-Type: application/json" -d '{"email":"nobody@x.io","password":"whatever"}')
check "unknown email rejected" 401 "$CODE"

echo
echo "=== 2. Login with wrong password -> 401 ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/login -H "Content-Type: application/json" -d '{"email":"registrar@votechain.demo","password":"wrong"}')
check "wrong password rejected" 401 "$CODE"

echo
echo "=== 3. Malformed body -> 422 ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/login -H "Content-Type: application/json" -d '{"email":"not-an-email"}')
check "invalid body rejected" 422 "$CODE"

echo
echo "=== 4. Staff login (registrar) -> immediate JWT ==="
RESP=$(curl -s -X POST $BASE/login -H "Content-Type: application/json" -d '{"email":"registrar@votechain.demo","password":"DemoPassword123!"}')
STAFF_JWT=$(echo "$RESP" | extract ".data.jwt")
ROLE=$(echo "$RESP" | extract ".data.user.role")
echo "  -> role: $ROLE | jwt: ${STAFF_JWT:0:25}..."
[ -n "$STAFF_JWT" ] && check "staff login returns jwt" 200 200 || check "staff login returns jwt" 200 500

echo
echo "=== 5. GET /auth/me with staff JWT ==="
ME=$(curl -s $BASE/me -H "Authorization: Bearer $STAFF_JWT")
ME_EMAIL=$(echo "$ME" | extract ".data.email")
CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE/me -H "Authorization: Bearer $STAFF_JWT")
check "me returns profile (email=$ME_EMAIL)" 200 "$CODE"

echo
echo "=== 6. GET /auth/me without token -> 401 ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE/me)
check "me unauthenticated" 401 "$CODE"

echo
echo "=== 7. Voter login -> otpRequired + pendingToken (no JWT yet) ==="
RESP=$(curl -s -X POST $BASE/login -H "Content-Type: application/json" -d '{"email":"voter1@votechain.demo","password":"DemoPassword123!"}')
PENDING=$(echo "$RESP" | extract ".data.pendingToken")
OTP_REQUIRED=$(echo "$RESP" | extract ".data.otpRequired")
VJWT=$(echo "$RESP" | extract ".data.jwt")
echo "  -> otpRequired: $OTP_REQUIRED | pendingToken: ${PENDING:0:25}... | jwt: '${VJWT:0:0}'"
[ -n "$PENDING" ] && [ "$OTP_REQUIRED" = "true" ] && check "voter login requires OTP" 200 200 || check "voter login requires OTP" 200 500

echo
echo "=== 8. Send OTP (development mode returns devOtp) ==="
RESP=$(curl -s -X POST $BASE/send-otp -H "Content-Type: application/json" -d "{\"pendingToken\":\"$PENDING\"}")
DEV_OTP=$(echo "$RESP" | extract ".data.devOtp")
echo "  -> devOtp: $DEV_OTP"
[ ${#DEV_OTP} -eq 6 ] && check "otp issued (6 digits)" 200 200 || check "otp issued (6 digits)" 200 500

echo
echo "=== 9. Wrong OTP -> 400 OTP_MISMATCH ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/verify-otp -H "Content-Type: application/json" -d "{\"pendingToken\":\"$PENDING\",\"otp\":\"000000\"}")
# devOtp could theoretically be 000000 — regenerate in that unlikely case
if [ "$DEV_OTP" = "000000" ]; then
  RESP=$(curl -s -X POST $BASE/send-otp -H "Content-Type: application/json" -d "{\"pendingToken\":\"$PENDING\"}")
  DEV_OTP=$(echo "$RESP" | extract ".data.devOtp")
fi
check "wrong otp rejected" 400 "$CODE"

echo
echo "=== 10. Correct OTP -> JWT issued ==="
RESP=$(curl -s -X POST $BASE/verify-otp -H "Content-Type: application/json" -d "{\"pendingToken\":\"$PENDING\",\"otp\":\"$DEV_OTP\"}")
VOTER_JWT=$(echo "$RESP" | extract ".data.jwt")
V_ROLE=$(echo "$RESP" | extract ".data.user.role")
echo "  -> role: $V_ROLE | jwt: ${VOTER_JWT:0:25}..."
[ -n "$VOTER_JWT" ] && check "otp verification issues jwt" 200 200 || check "otp verification issues jwt" 200 500

echo
echo "=== 11. OTP/pending-token single-use: replay after success -> 401 ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/verify-otp -H "Content-Type: application/json" -d "{\"pendingToken\":\"$PENDING\",\"otp\":\"$DEV_OTP\"}")
check "otp replay rejected (pending token consumed)" 401 "$CODE"

echo
echo "=== 12. Voter JWT works on registrar route (RBAC from real JWT) -> 403 ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/registrar/voters -H "Authorization: Bearer $VOTER_JWT")
check "voter forbidden from registrar routes" 403 "$CODE"

echo
echo "=== 13. Registrar JWT (from real login) passes registrar RBAC -> 200 ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/registrar/voters -H "Authorization: Bearer $STAFF_JWT")
check "registrar jwt grants access" 200 "$CODE"

echo
echo "=== 14. Old pendingToken cannot send OTP after successful verify -> 400/401 ==="
RESP=$(curl -s -X POST $BASE/login -H "Content-Type: application/json" -d '{"email":"voter2@votechain.demo","password":"DemoPassword123!"}')
P2=$(echo "$RESP" | extract ".data.pendingToken")
curl -s -X POST $BASE/send-otp -H "Content-Type: application/json" -d "{\"pendingToken\":\"$P2\"}" > /dev/null
RESP=$(curl -s -X POST $BASE/send-otp -H "Content-Type: application/json" -d "{\"pendingToken\":\"$P2\"}")
D2=$(echo "$RESP" | extract ".data.devOtp")
curl -s -X POST $BASE/verify-otp -H "Content-Type: application/json" -d "{\"pendingToken\":\"$P2\",\"otp\":\"$D2\"}" > /dev/null
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/send-otp -H "Content-Type: application/json" -d "{\"pendingToken\":\"$P2\"}")
check "expired pending token rejected" 401 "$CODE"

echo
echo "=== 15. POST /auth/logout -> 200 ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/logout)
check "logout endpoint" 200 "$CODE"

echo
echo "==================================================="
echo "RESULTS: $PASS passed, $FAIL failed"
fuser -k 8080/tcp 2>/dev/null
[ "$FAIL" -eq 0 ] && echo "ALL TESTS PASSED ✅" || echo "SOME TESTS FAILED ❌"
exit "$FAIL"
