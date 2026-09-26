# Data Model

Source of truth: `backend/prisma/schema.prisma` (PostgreSQL via Prisma). Seeding: `backend/prisma/seed.ts` — 50 mock Aadhaar records, an admin, a registrar, an auditor, and 10 voters.

## Enums

| Enum                | Values                                                                    |
| ------------------- | ------------------------------------------------------------------------- |
| `Role`              | `REGISTRAR`, `VOTER`, `ADMIN`, `AUDITOR`                                   |
| `OTPPurpose`        | `LOGIN`, `REGISTRATION`                                                    |
| `ElectionStatus`    | `DRAFT`, `PUBLISHED`, `CLOSED`, `RESULTS_PUBLISHED`                        |
| `TransactionStatus` | `PENDING`, `CONFIRMED`, `FAILED`                                           |
| `AuditEventType`    | `AUTH_LOGIN`, `OTP_SENT`, `OTP_VERIFIED`, `VOTER_REGISTERED`, `CREDENTIAL_ISSUED`, `BALLOT_CREATED`, `BALLOT_HASHED`, `BLOCKCHAIN_SUBMITTED`, `BLOCKCHAIN_CONFIRMED`, `CREDENTIAL_USED`, `VERIFICATION_PERFORMED`, `ELECTION_CREATED`, `ELECTION_PUBLISHED`, `ELECTION_CLOSED`, `RESULTS_PUBLISHED` |

## Models and relationships

```
MockAadhaar 1──0..1 VoterProfile 1──1 User (Role: VOTER)
                      │
                      └──0..* VoterEligibility *──1 Election
                                   │
                                   └──0..1 AnonymousCredential (unique per eligibility)

User 1──* Election (createdBy) 1──* Candidate 1──* Ballot
                                    Ballot *──0..1 BlockchainTransaction
User 1──* OTPCode
User 1──* AuditRecord *──0..1 Election
```

| Model                   | Key fields | Notes |
| ----------------------- | ---------- | ----- |
| `MockAadhaar`           | `aadhaarNumber` (unique), `fullName`, `dateOfBirth`, `gender`, `address`, `phone` | Mocked national identity registry used for voter registration; `address` is never exposed by registrar search |
| `User`                  | `email` (unique), `passwordHash`, `role`, `isActive` | bcrypt-hashed passwords; one role per user |
| `VoterProfile`          | `userId` (unique), `aadhaarId` (unique), `registeredByUserId` | Links a voter account to exactly one Aadhaar record; records which registrar registered them |
| `VoterEligibility`      | `voterProfileId`, `electionId` (unique pair), `isEligible`, `reason?` | Per-election eligibility matrix row |
| `OTPCode`               | `userId`, `codeHash` (HMAC-SHA256 + pepper), `purpose`, `expiresAt`, `consumedAt?` | Single-use; consumed via atomic `updateMany(consumedAt: null)` |
| `Election`              | `title`, `description`, `status`, `startDate`, `endDate`, `createdByUserId` | Lifecycle: `DRAFT → PUBLISHED → CLOSED → RESULTS_PUBLISHED` |
| `Candidate`             | `electionId`, `name`, `party`, `symbolUrl?` | Belongs to one election |
| `AnonymousCredential`   | `credentialHash` (unique), `voterEligibilityId` (unique), `isUsed`, `usedAt?` | The voter's single-use "ballot token"; no user id stored — this is the privacy boundary |
| `Ballot`                | `electionId`, `candidateId`, `credentialHash`, `encryptedPayload`, `ballotHash` (unique), `transactionId?` | **No `userId` column** — ballots cannot be linked back to a voter through the database |
| `BlockchainTransaction` | `txId` (unique), `electionId`, `ballotHash`, `blockNumber?`, `status`, `confirmedAt?` | Mirrors ledger submissions; drives the explorer and receipts |
| `AuditRecord`           | `eventType`, `electionId?`, `actorUserId?`, `metadata? (Json)`, `timestamp` | Append-only trail; actor/election use `onDelete: SetNull` so records survive user/election deletion |

## Privacy-relevant design points

- `Ballot` stores `credentialHash`, never `userId` — the atomic vote transaction consumes the credential and creates the ballot in one Prisma `$transaction`, so a credential can only ever produce one ballot.
- Aadhaar data is masked in audit metadata (`…last4` only); the number itself never appears in logs or API responses beyond registrar search.
- `VoterProfile` ↔ `Aadhaar` is the only place full identity lives; everything downstream (eligibility, credentials, ballots) is hash-addressed.

## Schema changes

```bash
cd backend
# edit prisma/schema.prisma
npm run prisma:migrate    # creates + applies a migration (dev)
npm run prisma:generate   # regenerate the client
```

If you hit Prisma `P2022` ("column does not exist"), suspect database/migration drift — drop/recreate the local database and `prisma migrate deploy` + `prisma db seed`.
