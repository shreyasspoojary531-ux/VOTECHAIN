# Blockchain Layer

Isolated ledger abstraction in `backend/src/blockchain/` — the rest of the application never talks to Fabric SDK directly.

## Files

| File                 | Responsibility                                                        |
| -------------------- | --------------------------------------------------------------------- |
| `types.ts`           | Fabric block/transaction and input types                              |
| `fabric.client.ts`   | Fabric client connection manager                                      |
| `fabric.gateway.ts`  | Gateway with transaction submission & query map                       |
| `fabric.service.ts`  | **The only API surface**: `submitVote()`, `getTransaction()`, `getBlock()`, `verifyTransaction()` |
| `transactions.ts`    | Ballot hash formatter & ledger event logger                           |

## What a vote does, end to end

1. **Credential issue** — `POST /votes/credential`: `credentialRepository.getOrCreateCredential(voterProfileId, electionId)` returns the voter's single-use anonymous credential. Reuse → `409 DUPLICATE_VOTE`.
2. **Ballot hash** — `formatBallotHash(electionId, candidateId, credentialHash)` builds the deterministic hash committed to the ledger.
3. **Ledger submit** — `fabricService.submitVote({ electionId, ballotHash, encryptedPayload, credentialHash })` → `{ txId, blockNumber }`.
4. **Atomic persistence** — `votingRepository.submitVoteAtomic(...)` runs one Prisma `$transaction`:
   - verifies the election is `PUBLISHED`,
   - consumes the single-use `AnonymousCredential`,
   - creates the `Ballot` (zero identity reference),
   - creates the `BlockchainTransaction` record and writes an `AuditRecord`,
   - rolls back everything on any ledger/database failure.
5. **Receipt** — `GET /votes/receipt/:txId` returns the verifiable receipt; `GET /blockchain/verify/:txId` re-checks the ledger.

## Verification surfaces

- **Voter:** receipt by `txId` (`/votes/receipt/:txId`) + transaction detail (`/blockchain/transactions/:txId`).
- **Anyone:** block explorer (`/blockchain/blocks`, `/blockchain/blocks/:number`) and `verifyTransaction`.
- **Auditor:** `GET /audit/elections/:id/verify` — end-to-end chain verification for an election (ballots ↔ transactions ↔ ledger).

## Configuration

| Env var            | Default                 |
| ------------------ | ----------------------- |
| `FABRIC_CHANNEL`   | `votechannel`           |
| `FABRIC_CHAINCODE` | `votechain`             |
| `FABRIC_NETWORK`   | `./blockchain/network`  |

The abstraction currently runs in a simulated/mock mode so the full stack works without a Fabric network; see limitations.md for what that implies.
