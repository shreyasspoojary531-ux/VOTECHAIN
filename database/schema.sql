-- VoteChain Relational Database Schema (PostgreSQL)

-- Enums
CREATE TYPE "Role" AS ENUM ('REGISTRAR', 'VOTER', 'ADMIN', 'AUDITOR');
CREATE TYPE "OTPPurpose" AS ENUM ('LOGIN', 'REGISTRATION');
CREATE TYPE "ElectionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'RESULTS_PUBLISHED');
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');
CREATE TYPE "AuditEventType" AS ENUM (
  'AUTH_LOGIN',
  'OTP_SENT',
  'OTP_VERIFIED',
  'VOTER_REGISTERED',
  'CREDENTIAL_ISSUED',
  'BALLOT_CREATED',
  'BALLOT_HASHED',
  'BLOCKCHAIN_SUBMITTED',
  'BLOCKCHAIN_CONFIRMED',
  'CREDENTIAL_USED',
  'VERIFICATION_PERFORMED',
  'ELECTION_CREATED',
  'ELECTION_PUBLISHED',
  'ELECTION_CLOSED',
  'RESULTS_PUBLISHED'
);

-- Mock Aadhaar Table
CREATE TABLE "MockAadhaar" (
  "id" TEXT PRIMARY KEY,
  "aadhaarNumber" TEXT UNIQUE NOT NULL,
  "fullName" TEXT NOT NULL,
  "dateOfBirth" TIMESTAMP(3) NOT NULL,
  "gender" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User Accounts
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Voter Profiles
CREATE TABLE "VoterProfile" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "aadhaarId" TEXT UNIQUE NOT NULL REFERENCES "MockAadhaar"("id") ON DELETE CASCADE,
  "registeredByUserId" TEXT NOT NULL REFERENCES "User"("id"),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Elections
CREATE TABLE "Election" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "ElectionStatus" NOT NULL DEFAULT 'DRAFT',
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "createdByUserId" TEXT NOT NULL REFERENCES "User"("id"),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Candidates
CREATE TABLE "Candidate" (
  "id" TEXT PRIMARY KEY,
  "electionId" TEXT NOT NULL REFERENCES "Election"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "party" TEXT NOT NULL,
  "symbolUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Voter Eligibility
CREATE TABLE "VoterEligibility" (
  "id" TEXT PRIMARY KEY,
  "voterProfileId" TEXT NOT NULL REFERENCES "VoterProfile"("id") ON DELETE CASCADE,
  "electionId" TEXT NOT NULL REFERENCES "Election"("id") ON DELETE CASCADE,
  "isEligible" BOOLEAN NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VoterEligibility_voterProfileId_electionId_key" UNIQUE ("voterProfileId", "electionId")
);

-- Anonymous Credentials
CREATE TABLE "AnonymousCredential" (
  "id" TEXT PRIMARY KEY,
  "credentialHash" TEXT UNIQUE NOT NULL,
  "electionId" TEXT NOT NULL REFERENCES "Election"("id") ON DELETE CASCADE,
  "voterEligibilityId" TEXT UNIQUE NOT NULL REFERENCES "VoterEligibility"("id") ON DELETE CASCADE,
  "isUsed" BOOLEAN NOT NULL DEFAULT false,
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "usedAt" TIMESTAMP(3)
);

-- Blockchain Transactions
CREATE TABLE "BlockchainTransaction" (
  "id" TEXT PRIMARY KEY,
  "txId" TEXT UNIQUE NOT NULL,
  "electionId" TEXT NOT NULL REFERENCES "Election"("id") ON DELETE CASCADE,
  "ballotHash" TEXT NOT NULL,
  "blockNumber" INT,
  "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
  "confirmedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ballots
CREATE TABLE "Ballot" (
  "id" TEXT PRIMARY KEY,
  "electionId" TEXT NOT NULL REFERENCES "Election"("id") ON DELETE CASCADE,
  "candidateId" TEXT NOT NULL REFERENCES "Candidate"("id"),
  "credentialHash" TEXT NOT NULL,
  "encryptedPayload" TEXT NOT NULL,
  "ballotHash" TEXT UNIQUE NOT NULL,
  "transactionId" TEXT UNIQUE REFERENCES "BlockchainTransaction"("id"),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- OTP Codes
CREATE TABLE "OTPCode" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "codeHash" TEXT NOT NULL,
  "purpose" "OTPPurpose" NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Audit Records
CREATE TABLE "AuditRecord" (
  "id" TEXT PRIMARY KEY,
  "eventType" "AuditEventType" NOT NULL,
  "electionId" TEXT REFERENCES "Election"("id") ON DELETE SET NULL,
  "actorUserId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "metadata" JSONB,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
