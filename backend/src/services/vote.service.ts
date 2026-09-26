import crypto from "crypto";
import { ApiError } from "../middleware/errorHandler";
import { prisma } from "../utils/prisma";
import { logger } from "../utils/logger";
import * as voterRepo from "../repositories/voter.repository";
import * as electionRepo from "../repositories/election.repository";
import * as voteRepo from "../repositories/vote.repository";
import * as fabric from "../blockchain/fabric.service";
import { logEvent } from "./audit.service";

/**
 * PHASE 4 — VOTING
 * JWT → RBAC → eligibility → duplicate prevention → anonymous credential →
 * ballot hash → Fabric tx → tx reference → receipt. All atomic.
 */

export async function requestCredential(electionId: string, userId: string, role: string) {
  if (role !== "VOTER") {
    throw new ApiError(403, "FORBIDDEN", "Only voters can request credentials");
  }

  const profile = await voterRepo.findProfileByUserId(userId);
  if (!profile || !profile.isVerified) {
    throw new ApiError(403, "NOT_A_VERIFIED_VOTER", "No verified voter profile found");
  }

  const election = await electionRepo.findElectionById(electionId);
  if (!election) throw new ApiError(404, "ELECTION_NOT_FOUND", "Election not found");
  if (election.status !== "ACTIVE") {
    throw new ApiError(409, "ELECTION_NOT_ACTIVE", "Election is not open for voting");
  }

  const eligibility = await voterRepo.findEligibility(profile.id, electionId);
  if (!eligibility || !eligibility.eligible) {
    throw new ApiError(403, "NOT_ELIGIBLE", "You are not eligible for this election");
  }

  // One live (unused) credential per voter per election.
  const existing = await prisma.anonymousCredential.findFirst({
    where: { electionId, issuedTo: userId, used: false },
  });
  if (existing) {
    return { credential: existing.credential, electionId, reused: true };
  }

  const credential = await voteRepo.createCredential({ electionId, issuedTo: userId });

  await logEvent({
    eventType: "CREDENTIAL_ISSUED",
    electionId,
    actorUserId: userId,
    actorRole: role,
    metadata: { credentialId: credential.id },
  });

  return { credential: credential.credential, electionId, reused: false };
}

/**
 * The atomic vote submission. Steps (single Prisma interactive transaction):
 *   1 validate election   2 validate eligibility   3 prevent duplicate vote
 *   4 consume credential  5 create ballot           6 store blockchain reference
 * Any failure rolls back everything — including an already-submitted chain tx.
 */
export async function castVote(credential: string, candidateId: string, userId: string, role: string) {
  if (role !== "VOTER") {
    throw new ApiError(403, "FORBIDDEN", "Only voters can cast ballots");
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Validate election is ACTIVE.
    const cred = await tx.anonymousCredential.findUnique({
      where: { credential },
      include: { election: true },
    });
    if (!cred) {
      throw new ApiError(404, "CREDENTIAL_INVALID", "Credential not found");
    }
    if (cred.used) {
      throw new ApiError(409, "DUPLICATE_VOTE", "This credential has already been used to vote");
    }
    if (cred.issuedTo !== userId) {
      // A credential is bound to the voter it was issued to.
      throw new ApiError(403, "CREDENTIAL_NOT_YOURS", "Credential does not belong to the authenticated voter");
    }
    if (cred.election.status !== "ACTIVE") {
      throw new ApiError(409, "ELECTION_NOT_ACTIVE", "Election is not open for voting");
    }

    // 2. Validate eligibility.
    const profile = await tx.voterProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new ApiError(403, "NOT_A_VERIFIED_VOTER", "No voter profile found");
    }
    const eligibility = await tx.voterEligibility.findUnique({
      where: { voterProfileId_electionId: { voterProfileId: profile.id, electionId: cred.electionId } },
    });
    if (!eligibility || !eligibility.eligible) {
      throw new ApiError(403, "NOT_ELIGIBLE", "You are not eligible for this election");
    }

    // 3. Candidate must belong to the same election.
    const candidate = await tx.candidate.findUnique({ where: { id: candidateId } });
    if (!candidate || candidate.electionId !== cred.electionId) {
      throw new ApiError(400, "CANDIDATE_INVALID", "Candidate is not in this election");
    }

    // 4. Consume the credential (used=true) — the duplicate guard.
    await tx.anonymousCredential.update({ where: { id: cred.id }, data: { used: true } });

    // 5. Create the ballot — identity-free. ballotHash binds the vote.
    const ballotHash = crypto
      .createHash("sha256")
      .update(`${cred.electionId}|${candidateId}|${cred.credential}|${process.env.OTP_PEPPER ?? "pepper"}`)
      .digest("hex");
    const ballot = await tx.ballot.create({
      data: { credentialId: cred.id, candidateId, ballotHash },
    });

    // 6. Submit to the chain and store the reference. If this throws,
    //    the whole transaction (credential + ballot) rolls back.
    const chainTx = await fabric.submitVote({
      electionId: cred.electionId,
      credentialId: cred.credential,
      candidateId,
      ballotHash,
    });
    await tx.blockchainTransaction.create({
      data: {
        ballotId: ballot.id,
        transactionId: chainTx.transactionId,
        blockNumber: chainTx.blockNumber,
        status: "VALID",
      },
    });

    return { ballot, chainTx };
  });

  await logEvent({
    eventType: "VOTE_CAST",
    electionId: result.ballot.candidateId ? undefined : undefined,
    actorUserId: userId,
    actorRole: role,
    metadata: { txId: result.chainTx.transactionId }, // never the candidate
  });

  // Receipt — lets the voter verify their ballot landed without revealing it.
  return {
    txId: result.chainTx.transactionId,
    blockNumber: result.chainTx.blockNumber,
    ballotHash: result.ballot.ballotHash,
    submittedAt: result.ballot.submittedAt,
  };
}

export async function voteStatus(userId: string) {
  const profile = await voterRepo.findProfileByUserId(userId);
  if (!profile) {
    throw new ApiError(403, "NOT_A_VERIFIED_VOTER", "No voter profile found");
  }
  const credentials = await prisma.anonymousCredential.findMany({
    where: { issuedTo: userId },
    include: { ballots: { include: { blockchainTx: true, candidate: { select: { id: true, name: true } } } }, election: { select: { id: true, title: true, status: true } } },
  });
  return credentials.map((c) => ({
    election: c.election,
    hasVoted: c.used,
    txId: c.ballots[0]?.blockchainTx?.transactionId,
    votedAt: c.ballots[0]?.submittedAt,
  }));
}

/** Receipt lookup by txId — proves a vote exists without revealing its content. */
export async function getReceipt(txId: string, userId: string) {
  const record = await prisma.blockchainTransaction.findUnique({
    where: { transactionId: txId },
    include: { ballot: { include: { credential: true } } },
  });
  if (!record) {
    throw new ApiError(404, "RECEIPT_NOT_FOUND", "No transaction found for that id");
  }
  if (record.ballot.credential.issuedTo !== userId) {
    throw new ApiError(403, "FORBIDDEN", "Receipts are only visible to the voter who cast them");
  }
  return {
    txId: record.transactionId,
    blockNumber: record.blockNumber,
    status: record.status,
    ballotHash: record.ballot.ballotHash,
    recordedAt: record.recordedAt,
  };
}

/** PHASE 5 — results. Admin closes → auditor verifies → admin declares. */
export async function declareResults(electionId: string, adminId: string, adminRole: string) {
  const election = await electionRepo.findElectionById(electionId);
  if (!election) throw new ApiError(404, "ELECTION_NOT_FOUND", "Election not found");
  if (election.status !== "CLOSED") {
    throw new ApiError(409, "ELECTION_NOT_CLOSED", "Close the election before declaring results");
  }

  // Auditor-grade check before publishing: chain integrity must hold.
  const integrity = await fabric.verifyElectionChain();
  if (!integrity.chainValid) {
    throw new ApiError(500, "CHAIN_TAMPERED", `Blockchain integrity check failed: ${integrity.reason}`);
  }

  const tally = await voteRepo.tallyByElection(electionId);
  const results = tally
    .map((c) => ({ candidateId: c.id, name: c.name, party: c.party, votes: c._count.ballots }))
    .sort((a, b) => b.votes - a.votes);
  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

  await electionRepo.updateElectionStatus(electionId, "RESULTS");
  await logEvent({
    eventType: "ELECTION_RESULTS",
    electionId,
    actorUserId: adminId,
    actorRole: adminRole,
    metadata: { totalVotes },
  });

  return { electionId, totalVotes, results };
}
