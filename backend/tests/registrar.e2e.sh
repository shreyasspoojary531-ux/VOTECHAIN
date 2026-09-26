#!/bin/bash
# End-to-end test for the Registrar module (Prompt 4).
# Starts the backend, mints a registrar JWT, and exercises all endpoints,
# including the required under-18 rejection and already-registered 409 cases.

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

# --- start backend ---
fuser -k 8080/tcp 2>/dev/null
sleep 1
(npx ts-node-dev --respawn --transpile-only src/server.ts > /tmp/backend-test.log 2>&1 &)
for i in $(seq 1 20); do
  curl -s --max-time 2 http://localhost:8080/api/v1/health | grep -q ok && break
  sleep 1
done
echo "backend: $(curl -s http://localhost:8080/api/v1/health)"

# --- mint a registrar JWT (login endpoint arrives in a later prompt) ---
TOKEN=$(node -e "
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findUnique({ where: { email: 'registrar@votechain.demo' } }).then(u => {
  if (!u) { console.error('registrar user not found — run: npx prisma db seed'); process.exit(2); }
  console.log(jwt.sign({ userId: u.id, role: u.role, email: u.email }, process.env.JWT_SECRET, { expiresIn: '1h' }));
  return prisma.\$disconnect();
});
") || exit 2
echo "token minted (${#TOKEN} chars)"

AUTH="Authorization: Bearer $TOKEN"
BASE="http://localhost:8080/api/v1/registrar"

echo
echo "=== 1. No token -> 401 ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE/voters)
check "unauthenticated request rejected" 401 "$CODE"

echo
echo "=== 2. Search by aadhaarNumber (adult, unregistered: 999910000010) ==="
CODE=$(curl -s -o /tmp/r.json -w "%{http_code}" "$BASE/aadhaar/search?aadhaarNumber=999910000010" -H "$AUTH")
check "search by exact aadhaarNumber" 200 "$CODE"
node -e "const d=require('/tmp/r.json'); console.log('  ->', d.data.length, 'result(s):', d.data[0]?.fullName, '| alreadyRegistered:', d.data[0]?.alreadyRegistered)"

echo
echo "=== 3. Search by partial fullName ('Sharma') ==="
CODE=$(curl -s -o /tmp/r.json -w "%{http_code}" "$BASE/aadhaar/search?fullName=Sharma" -H "$AUTH")
check "search by partial name" 200 "$CODE"
node -e "const d=require('/tmp/r.json'); console.log('  ->', d.data.length, 'match(es)')"

echo
echo "=== 4. Search with no params -> 422 ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/aadhaar/search" -H "$AUTH")
check "empty search rejected" 422 "$CODE"

echo
echo "=== 5. Under-18 registration rejected (999910000001 is a minor) ==="
CODE=$(curl -s -o /tmp/r.json -w "%{http_code}" -X POST "$BASE/register-voter" -H "$AUTH" -H "Content-Type: application/json" -d '{"aadhaarNumber":"999910000001"}')
check "under-18 rejected with 400" 400 "$CODE"
node -e "const d=require('/tmp/r.json'); console.log('  ->', d.error?.code, '-', d.error?.message)"

echo
echo "=== 6. Already-registered -> 409 (voter1 was seeded on 999910000006) ==="
CODE=$(curl -s -o /tmp/r.json -w "%{http_code}" -X POST "$BASE/register-voter" -H "$AUTH" -H "Content-Type: application/json" -d '{"aadhaarNumber":"999910000006"}')
check "duplicate registration rejected with 409" 409 "$CODE"
node -e "const d=require('/tmp/r.json'); console.log('  ->', d.error?.code, '-', d.error?.message)"

echo
echo "=== 7. Unknown Aadhaar -> 404 ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/register-voter" -H "$AUTH" -H "Content-Type: application/json" -d '{"aadhaarNumber":"111122223333"}')
check "unknown aadhaar rejected" 404 "$CODE"

echo
echo "=== 8. Successful registration (adult 999910000010; 409 if a previous run registered them) ==="
CODE=$(curl -s -o /tmp/r.json -w "%{http_code}" -X POST "$BASE/register-voter" -H "$AUTH" -H "Content-Type: application/json" -d '{"aadhaarNumber":"999910000010"}')
if [ "$CODE" = "201" ]; then
  check "valid adult registration" 201 "$CODE"
  node -e "const d=require('/tmp/r.json'); console.log('  -> email:', d.data?.email, '| tempPassword:', d.data?.temporaryPassword)"
elif [ "$CODE" = "409" ]; then
  check "valid adult registration (already registered by earlier run)" 409 "$CODE"
else
  check "valid adult registration" 201 "$CODE"
fi

echo
echo "=== 9. Voters list (should now include the new voter) ==="
CODE=$(curl -s -o /tmp/r.json -w "%{http_code}" "$BASE/voters?page=1&pageSize=10" -H "$AUTH")
check "list voters" 200 "$CODE"
node -e "const d=require('/tmp/r.json'); console.log('  -> total:', d.data?.total, '| first:', d.data?.data?.[0]?.email)"

echo
echo "=== 10. RBAC: voter token on registrar route -> 403 ==="
VTOKEN=$(node -e "
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findUnique({ where: { email: 'voter1@votechain.demo' } }).then(u => {
  console.log(jwt.sign({ userId: u.id, role: u.role, email: u.email }, process.env.JWT_SECRET, { expiresIn: '1h' }));
  return prisma.\$disconnect();
});
")
CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE/voters -H "Authorization: Bearer $VTOKEN")
check "non-registrar role forbidden" 403 "$CODE"

echo
echo "==================================================="
echo "RESULTS: $PASS passed, $FAIL failed"
fuser -k 8080/tcp 2>/dev/null
[ "$FAIL" -eq 0 ] && echo "ALL TESTS PASSED ✅" || echo "SOME TESTS FAILED ❌"
exit "$FAIL"
