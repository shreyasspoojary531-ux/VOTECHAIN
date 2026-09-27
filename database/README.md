# VoteChain Database Subsystem

This directory contains the database design, schema specification, entity-relationship diagrams, and SQL seed scripts for the VoteChain platform.

---

## 1. Subsystem Structure

```
database/
├── README.md               # Database subsystem overview and guide
├── schema.sql              # Standard DDL SQL schema for PostgreSQL
├── diagrams/
│   └── er_diagram.md       # Entity-Relationship diagram in Mermaid
├── seed/
│   └── sample_seed.sql     # Seed SQL file with demo credentials & mock Aadhaar data
└── migrations/             # Directory reserved for SQL migration scripts
```

---

## 2. Overview & ORM

VoteChain uses **PostgreSQL 16+** as its primary relational data store. Data persistence and schema migrations are managed via **Prisma ORM** (`backend/prisma/schema.prisma`).

### Domain Models & Enums

| Model / Enum | Description |
| ------------ | ----------- |
| `MockAadhaar` | Mock UIDAI registry containing identity details (Aadhaar number, DOB, phone, address). |
| `User` | Authenticated system accounts across 4 RBAC roles (`ADMIN`, `REGISTRAR`, `VOTER`, `AUDITOR`). |
| `VoterProfile` | Maps an authenticated `User` account to a verified `MockAadhaar` citizen record. |
| `VoterEligibility` | Per-election eligibility status for a registered voter. |
| `OTPCode` | Ephemeral one-time passwords for authentication and 2FA verification. |
| `Election` | Voting events managed by Admins (statuses: `DRAFT`, `PUBLISHED`, `CLOSED`, `RESULTS_PUBLISHED`). |
| `Candidate` | Contestants running under a specific election. |
| `AnonymousCredential` | One-time anonymous ballot tokens ensuring un-linkability between voter identity and vote cast. |
| `Ballot` | Cast vote container linked to an election, candidate, encrypted payload, and blockchain transaction. |
| `BlockchainTransaction` | Immutable transaction record mirroring the ledger transaction. |
| `AuditRecord` | System audit trail logging all sensitive operations and status transitions. |

---

## 3. Database Commands Quick Reference

### Running Migrations
Inside `backend/`:
```bash
# Apply pending Prisma migrations
npx prisma migrate dev --name init

# Deploy migrations in production environment
npx prisma migrate deploy
```

### Seeding Test Data
Inside `backend/`:
```bash
# Seed default system users (Admin, Registrar, Auditor, Voter) & 50 Mock Aadhaar citizens
npx prisma db seed
```

### Executing Raw SQL
Using `psql`:
```bash
# Initialize schema directly via raw SQL
psql -U postgres -d votechain -f ../database/schema.sql

# Seed data directly via raw SQL
psql -U postgres -d votechain -f ../database/seed/sample_seed.sql
```
