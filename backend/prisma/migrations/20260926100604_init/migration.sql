-- CreateEnum
CREATE TYPE "Role" AS ENUM ('REGISTRAR', 'VOTER', 'ADMIN', 'AUDITOR');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ElectionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ACTIVE', 'CLOSED', 'RESULTS');

-- CreateEnum
CREATE TYPE "BlockchainStatus" AS ENUM ('PENDING', 'VALID', 'INVALID');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateTable
CREATE TABLE "MockAadhaar" (
    "id" TEXT NOT NULL,
    "aadhaarNumber" VARCHAR(12) NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    "gender" "Gender" NOT NULL,
    "phone" VARCHAR(10) NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "constituency" TEXT NOT NULL,
    "isAlive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MockAadhaar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VOTER',
    "status" "UserStatus" NOT NULL DEFAULT 'INACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoterProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aadhaarId" TEXT NOT NULL,
    "constituency" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoterEligibility" (
    "id" TEXT NOT NULL,
    "voterProfileId" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "eligible" BOOLEAN NOT NULL DEFAULT true,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoterEligibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTPCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT 'LOGIN',
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTPCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Election" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "constituency" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" "ElectionStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Election_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "party" TEXT NOT NULL,
    "symbol" TEXT,
    "manifesto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnonymousCredential" (
    "id" TEXT NOT NULL,
    "credential" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "issuedTo" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnonymousCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ballot" (
    "id" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "ballotHash" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ballot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockchainTransaction" (
    "id" TEXT NOT NULL,
    "ballotId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "blockNumber" INTEGER,
    "status" "BlockchainStatus" NOT NULL DEFAULT 'PENDING',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockchainTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditRecord" (
    "id" TEXT NOT NULL,
    "electionId" TEXT,
    "actorId" TEXT,
    "actorRole" TEXT,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MockAadhaar_aadhaarNumber_key" ON "MockAadhaar"("aadhaarNumber");

-- CreateIndex
CREATE INDEX "MockAadhaar_aadhaarNumber_idx" ON "MockAadhaar"("aadhaarNumber");

-- CreateIndex
CREATE INDEX "MockAadhaar_constituency_idx" ON "MockAadhaar"("constituency");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VoterProfile_userId_key" ON "VoterProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VoterProfile_aadhaarId_key" ON "VoterProfile"("aadhaarId");

-- CreateIndex
CREATE INDEX "VoterProfile_constituency_idx" ON "VoterProfile"("constituency");

-- CreateIndex
CREATE INDEX "VoterProfile_aadhaarId_idx" ON "VoterProfile"("aadhaarId");

-- CreateIndex
CREATE INDEX "VoterEligibility_electionId_idx" ON "VoterEligibility"("electionId");

-- CreateIndex
CREATE UNIQUE INDEX "VoterEligibility_voterProfileId_electionId_key" ON "VoterEligibility"("voterProfileId", "electionId");

-- CreateIndex
CREATE INDEX "OTPCode_userId_purpose_isUsed_expiresAt_idx" ON "OTPCode"("userId", "purpose", "isUsed", "expiresAt");

-- CreateIndex
CREATE INDEX "Election_status_idx" ON "Election"("status");

-- CreateIndex
CREATE INDEX "Election_constituency_idx" ON "Election"("constituency");

-- CreateIndex
CREATE INDEX "Candidate_electionId_idx" ON "Candidate"("electionId");

-- CreateIndex
CREATE UNIQUE INDEX "AnonymousCredential_credential_key" ON "AnonymousCredential"("credential");

-- CreateIndex
CREATE INDEX "AnonymousCredential_electionId_idx" ON "AnonymousCredential"("electionId");

-- CreateIndex
CREATE INDEX "AnonymousCredential_issuedTo_idx" ON "AnonymousCredential"("issuedTo");

-- CreateIndex
CREATE UNIQUE INDEX "Ballot_credentialId_key" ON "Ballot"("credentialId");

-- CreateIndex
CREATE UNIQUE INDEX "Ballot_ballotHash_key" ON "Ballot"("ballotHash");

-- CreateIndex
CREATE INDEX "Ballot_ballotHash_idx" ON "Ballot"("ballotHash");

-- CreateIndex
CREATE INDEX "Ballot_candidateId_idx" ON "Ballot"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainTransaction_ballotId_key" ON "BlockchainTransaction"("ballotId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainTransaction_transactionId_key" ON "BlockchainTransaction"("transactionId");

-- CreateIndex
CREATE INDEX "BlockchainTransaction_transactionId_idx" ON "BlockchainTransaction"("transactionId");

-- CreateIndex
CREATE INDEX "BlockchainTransaction_status_idx" ON "BlockchainTransaction"("status");

-- CreateIndex
CREATE INDEX "AuditRecord_electionId_idx" ON "AuditRecord"("electionId");

-- CreateIndex
CREATE INDEX "AuditRecord_action_idx" ON "AuditRecord"("action");

-- AddForeignKey
ALTER TABLE "VoterProfile" ADD CONSTRAINT "VoterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterProfile" ADD CONSTRAINT "VoterProfile_aadhaarId_fkey" FOREIGN KEY ("aadhaarId") REFERENCES "MockAadhaar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterEligibility" ADD CONSTRAINT "VoterEligibility_voterProfileId_fkey" FOREIGN KEY ("voterProfileId") REFERENCES "VoterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterEligibility" ADD CONSTRAINT "VoterEligibility_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTPCode" ADD CONSTRAINT "OTPCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Election" ADD CONSTRAINT "Election_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnonymousCredential" ADD CONSTRAINT "AnonymousCredential_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnonymousCredential" ADD CONSTRAINT "AnonymousCredential_issuedTo_fkey" FOREIGN KEY ("issuedTo") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ballot" ADD CONSTRAINT "Ballot_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "AnonymousCredential"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ballot" ADD CONSTRAINT "Ballot_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockchainTransaction" ADD CONSTRAINT "BlockchainTransaction_ballotId_fkey" FOREIGN KEY ("ballotId") REFERENCES "Ballot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRecord" ADD CONSTRAINT "AuditRecord_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRecord" ADD CONSTRAINT "AuditRecord_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
