-- CreateEnum
CREATE TYPE "Role" AS ENUM ('REGISTRAR', 'VOTER', 'ADMIN', 'AUDITOR');

-- CreateEnum
CREATE TYPE "OTPPurpose" AS ENUM ('LOGIN', 'REGISTRATION');

-- CreateEnum
CREATE TYPE "ElectionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'RESULTS_PUBLISHED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "AuditEventType" AS ENUM ('AUTH_LOGIN', 'OTP_SENT', 'OTP_VERIFIED', 'VOTER_REGISTERED', 'CREDENTIAL_ISSUED', 'BALLOT_CREATED', 'BALLOT_HASHED', 'BLOCKCHAIN_SUBMITTED', 'BLOCKCHAIN_CONFIRMED', 'CREDENTIAL_USED', 'VERIFICATION_PERFORMED', 'ELECTION_CREATED', 'ELECTION_PUBLISHED', 'ELECTION_CLOSED', 'RESULTS_PUBLISHED');

-- CreateTable
CREATE TABLE "MockAadhaar" (
    "id" TEXT NOT NULL,
    "aadhaarNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockAadhaar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoterProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aadhaarId" TEXT NOT NULL,
    "registeredByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoterEligibility" (
    "id" TEXT NOT NULL,
    "voterProfileId" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "isEligible" BOOLEAN NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoterEligibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTPCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "purpose" "OTPPurpose" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTPCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Election" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ElectionStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Election_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "party" TEXT NOT NULL,
    "symbolUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnonymousCredential" (
    "id" TEXT NOT NULL,
    "credentialHash" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "voterEligibilityId" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "AnonymousCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ballot" (
    "id" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "credentialHash" TEXT NOT NULL,
    "encryptedPayload" TEXT NOT NULL,
    "ballotHash" TEXT NOT NULL,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ballot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockchainTransaction" (
    "id" TEXT NOT NULL,
    "txId" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "ballotHash" TEXT NOT NULL,
    "blockNumber" INTEGER,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockchainTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditRecord" (
    "id" TEXT NOT NULL,
    "eventType" "AuditEventType" NOT NULL,
    "electionId" TEXT,
    "actorUserId" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MockAadhaar_aadhaarNumber_key" ON "MockAadhaar"("aadhaarNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VoterProfile_userId_key" ON "VoterProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VoterProfile_aadhaarId_key" ON "VoterProfile"("aadhaarId");

-- CreateIndex
CREATE UNIQUE INDEX "VoterEligibility_voterProfileId_electionId_key" ON "VoterEligibility"("voterProfileId", "electionId");

-- CreateIndex
CREATE UNIQUE INDEX "AnonymousCredential_credentialHash_key" ON "AnonymousCredential"("credentialHash");

-- CreateIndex
CREATE UNIQUE INDEX "AnonymousCredential_voterEligibilityId_key" ON "AnonymousCredential"("voterEligibilityId");

-- CreateIndex
CREATE UNIQUE INDEX "Ballot_ballotHash_key" ON "Ballot"("ballotHash");

-- CreateIndex
CREATE UNIQUE INDEX "Ballot_transactionId_key" ON "Ballot"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainTransaction_txId_key" ON "BlockchainTransaction"("txId");

-- AddForeignKey
ALTER TABLE "VoterProfile" ADD CONSTRAINT "VoterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterProfile" ADD CONSTRAINT "VoterProfile_aadhaarId_fkey" FOREIGN KEY ("aadhaarId") REFERENCES "MockAadhaar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterProfile" ADD CONSTRAINT "VoterProfile_registeredByUserId_fkey" FOREIGN KEY ("registeredByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterEligibility" ADD CONSTRAINT "VoterEligibility_voterProfileId_fkey" FOREIGN KEY ("voterProfileId") REFERENCES "VoterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterEligibility" ADD CONSTRAINT "VoterEligibility_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTPCode" ADD CONSTRAINT "OTPCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Election" ADD CONSTRAINT "Election_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnonymousCredential" ADD CONSTRAINT "AnonymousCredential_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnonymousCredential" ADD CONSTRAINT "AnonymousCredential_voterEligibilityId_fkey" FOREIGN KEY ("voterEligibilityId") REFERENCES "VoterEligibility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ballot" ADD CONSTRAINT "Ballot_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ballot" ADD CONSTRAINT "Ballot_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ballot" ADD CONSTRAINT "Ballot_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "BlockchainTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockchainTransaction" ADD CONSTRAINT "BlockchainTransaction_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRecord" ADD CONSTRAINT "AuditRecord_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRecord" ADD CONSTRAINT "AuditRecord_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
