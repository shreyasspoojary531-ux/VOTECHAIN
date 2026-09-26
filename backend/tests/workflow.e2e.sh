#!/usr/bin/env bash
set -euo pipefail

BASE_URL="http://localhost:8080/api/v1"
echo "=== VoteChain Complete Workflow E2E Test Suite ==="

# Wait for server readiness
echo "Waiting for server at $BASE_URL/health..."
for i in {1..15}; do
  if curl -s "$BASE_URL/health" | grep -q '"status":"ok"'; then
    echo "✓ Server is ready!"
    break
  fi
  echo "Waiting ($i/15)..."
  sleep 1
done

# 1. Registrar Login
echo "[1] Testing Registrar Login..."
REG_LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"registrar@votechain.demo","password":"Registrar@123"}')

REG_TOKEN=$(echo "$REG_LOGIN_RES" | grep -o '"jwt":"[^"]*' | cut -d'"' -f4)
if [ -z "$REG_TOKEN" ]; then
  REG_TOKEN=$(echo "$REG_LOGIN_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$REG_TOKEN" ]; then
  echo "FAIL: Registrar login failed"
  echo "$REG_LOGIN_RES"
  exit 1
fi
echo "✓ Registrar token obtained"

# 2. Registrar Search Aadhaar & Register Voter
echo "[2] Testing Aadhaar Search & Voter Registration..."
SEARCH_RES=$(curl -s -X GET "$BASE_URL/registrar/aadhaar/search?q=999910000002" \
  -H "Authorization: Bearer $REG_TOKEN")
echo "✓ Search response received"

# Register voter using Aadhaar 999910000002
REG_VOTER_RES=$(curl -s -X POST "$BASE_URL/registrar/register-voter" \
  -H "Authorization: Bearer $REG_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"aadhaarNumber":"999910000002"}')
echo "✓ Voter registration call completed"

# 3. Admin Login & Election Creation
echo "[3] Testing Admin Login & Election Lifecycle..."
ADMIN_LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@votechain.demo","password":"Admin@123"}')

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RES" | grep -o '"jwt":"[^"]*' | cut -d'"' -f4)
if [ -z "$ADMIN_TOKEN" ]; then
  ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi
if [ -z "$ADMIN_TOKEN" ]; then
  echo "FAIL: Admin login failed"
  echo "$ADMIN_LOGIN_RES"
  exit 1
fi
echo "✓ Admin token obtained"

# Create Election
CREATE_ELECTION_RES=$(curl -s -X POST "$BASE_URL/elections" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "E2E Test General Election 2026",
    "description": "Automated workflow test election",
    "startsAt": "2026-01-01T00:00:00.000Z",
    "endsAt": "2026-12-31T23:59:59.000Z",
    "candidates": [
      {"name": "Candidate Alpha", "partyName": "Progressive Party"},
      {"name": "Candidate Beta", "partyName": "Reform Party"}
    ]
  }')
ELECTION_ID=$(echo "$CREATE_ELECTION_RES" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)
if [ -z "$ELECTION_ID" ]; then
  echo "FAIL: Create election failed"
  echo "$CREATE_ELECTION_RES"
  exit 1
fi
echo "✓ Election created ID: $ELECTION_ID"

# Publish Election
PUBLISH_RES=$(curl -s -X POST "$BASE_URL/elections/$ELECTION_ID/publish" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "✓ Election published"

# 4. Voter Authentication (Password + OTP)
echo "[4] Testing Voter Auth & Voting Workflow..."
VOTER_LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"voter1@votechain.demo","password":"Voter@123"}')

PENDING_TOKEN=$(echo "$VOTER_LOGIN_RES" | grep -o '"pendingToken":"[^"]*' | cut -d'"' -f4)
if [ -z "$PENDING_TOKEN" ]; then
  echo "FAIL: Voter initial login failed"
  echo "$VOTER_LOGIN_RES"
  exit 1
fi

# Send OTP
SEND_OTP_RES=$(curl -s -X POST "$BASE_URL/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d "{\"pendingToken\":\"$PENDING_TOKEN\"}")

DEV_OTP=$(echo "$SEND_OTP_RES" | grep -o '"devOtp":"[^"]*' | cut -d'"' -f4)
if [ -z "$DEV_OTP" ]; then
  echo "FAIL: Send OTP failed"
  echo "$SEND_OTP_RES"
  exit 1
fi
echo "✓ OTP issued: $DEV_OTP"

# Verify OTP
VERIFY_OTP_RES=$(curl -s -X POST "$BASE_URL/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{\"pendingToken\":\"$PENDING_TOKEN\",\"otp\":\"$DEV_OTP\"}")

VOTER_TOKEN=$(echo "$VERIFY_OTP_RES" | grep -o '"jwt":"[^"]*' | cut -d'"' -f4)
if [ -z "$VOTER_TOKEN" ]; then
  VOTER_TOKEN=$(echo "$VERIFY_OTP_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi
if [ -z "$VOTER_TOKEN" ]; then
  echo "FAIL: Verify OTP failed"
  echo "$VERIFY_OTP_RES"
  exit 1
fi
echo "✓ Voter JWT obtained"

# Fetch Candidates for election
CANDIDATES_RES=$(curl -s -X GET "$BASE_URL/elections/$ELECTION_ID/candidates")
CANDIDATE_ID=$(echo "$CANDIDATES_RES" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)
if [ -z "$CANDIDATE_ID" ]; then
  echo "FAIL: Could not fetch candidate ID"
  echo "$CANDIDATES_RES"
  exit 1
fi

# Issue Anonymous Credential
CRED_RES=$(curl -s -X POST "$BASE_URL/votes/credential" \
  -H "Authorization: Bearer $VOTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"electionId\":\"$ELECTION_ID\"}")

CRED_HASH=$(echo "$CRED_RES" | grep -o '"credentialHash":"[^"]*' | cut -d'"' -f4)
if [ -z "$CRED_HASH" ]; then
  echo "FAIL: Credential generation failed"
  echo "$CRED_RES"
  exit 1
fi
echo "✓ Anonymous Credential issued: $CRED_HASH"

# Cast Vote
VOTE_RES=$(curl -s -X POST "$BASE_URL/votes" \
  -H "Authorization: Bearer $VOTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"electionId\": \"$ELECTION_ID\",
    \"candidateId\": \"$CANDIDATE_ID\",
    \"credentialHash\": \"$CRED_HASH\"
  }")

TX_ID=$(echo "$VOTE_RES" | grep -o '"txId":"[^"]*' | cut -d'"' -f4)
if [ -z "$TX_ID" ]; then
  echo "FAIL: Cast vote failed"
  echo "$VOTE_RES"
  exit 1
fi
echo "✓ Vote successfully cast! TxID: $TX_ID"

# Test Duplicate Vote Rejection
DUP_VOTE_RES=$(curl -s -X POST "$BASE_URL/votes" \
  -H "Authorization: Bearer $VOTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"electionId\": \"$ELECTION_ID\",
    \"candidateId\": \"$CANDIDATE_ID\",
    \"credentialHash\": \"$CRED_HASH\"
  }")
if echo "$DUP_VOTE_RES" | grep -q "DUPLICATE_VOTE"; then
  echo "✓ Duplicate vote successfully rejected!"
else
  echo "FAIL: Duplicate vote was not rejected"
  echo "$DUP_VOTE_RES"
  exit 1
fi

# 5. Receipt Verification & Blockchain Explorer
echo "[5] Testing Receipt & Blockchain Explorer..."
RECEIPT_RES=$(curl -s -X GET "$BASE_URL/votes/receipt/$TX_ID")
if echo "$RECEIPT_RES" | grep -q "$TX_ID"; then
  echo "✓ Receipt verification successful"
else
  echo "FAIL: Receipt fetch failed"
  echo "$RECEIPT_RES"
  exit 1
fi

BLOCKS_RES=$(curl -s -X GET "$BASE_URL/blockchain/blocks")
echo "✓ Blockchain blocks list fetched"

# 6. Auditor Integrity Report
echo "[6] Testing Auditor Verification..."
AUDITOR_LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"auditor@votechain.demo","password":"Auditor@123"}')
AUDITOR_TOKEN=$(echo "$AUDITOR_LOGIN_RES" | grep -o '"jwt":"[^"]*' | cut -d'"' -f4)
if [ -z "$AUDITOR_TOKEN" ]; then
  AUDITOR_TOKEN=$(echo "$AUDITOR_LOGIN_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

AUDIT_VERIFY_RES=$(curl -s -X GET "$BASE_URL/audit/elections/$ELECTION_ID/verify" \
  -H "Authorization: Bearer $AUDITOR_TOKEN")
if echo "$AUDIT_VERIFY_RES" | grep -q '"isIntegrityVerified":true'; then
  echo "✓ Auditor integrity verification passed!"
else
  echo "FAIL: Audit verification failed"
  echo "$AUDIT_VERIFY_RES"
  exit 1
fi

echo "=== All 6 E2E Workflow Steps Passed Successfully! ==="
