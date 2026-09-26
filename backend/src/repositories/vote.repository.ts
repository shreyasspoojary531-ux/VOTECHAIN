import { prisma } from "../utils/prisma";

export const createCredential = (data: { electionId: string; issuedTo: string }) =>
  prisma.anonymousCredential.create({ data });

export const findCredential = (credential: string) =>
  prisma.anonymousCredential.findUnique({ where: { credential } });

/** The single vote-check used inside the atomic transaction. */
export const findUsedCredentialTx = (tx: { anonymousCredential: { findUnique(args: unknown): unknown } }, credential: string) =>
  tx.anonymousCredential.findUnique({ where: { credential } });

export const createBallot = (data: { credentialId: string; candidateId: string; ballotHash: string }) =>
  prisma.ballot.create({ data });

export const createBlockchainTx = (data: {
  ballotId: string;
  transactionId: string;
  blockNumber?: number;
  status: "PENDING" | "VALID" | "INVALID";
}) => prisma.blockchainTransaction.create({ data });

export const findBallotByHash = (ballotHash: string) =>
  prisma.ballot.findUnique({ where: { ballotHash }, include: { blockchainTx: true, candidate: true } });

export const findBallotByCredential = (credentialId: string) =>
  prisma.ballot.findUnique({ where: { credentialId }, include: { blockchainTx: true, candidate: true } });

export const tallyByElection = (electionId: string) =>
  prisma.candidate.findMany({
    where: { electionId },
    select: { id: true, name: true, party: true, _count: { select: { ballots: true } } },
  });

export const countBallotsByElection = async (electionId: string) => {
  const result = await prisma.ballot.aggregate({
    where: { credential: { electionId } },
    _count: true,
  });
  return result._count;
};
