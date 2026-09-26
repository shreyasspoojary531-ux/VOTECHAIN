import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

export interface SubmitVoteParams {
  electionId: string;
  candidateId: string;
  credentialHash: string;
  ballotHash: string;
  encryptedPayload: string;
  txId: string;
  blockNumber: number;
}

export const votingRepository = {
  async submitVoteAtomic(params: SubmitVoteParams) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Verify election exists and is active/published
      const election = await tx.election.findUnique({
        where: { id: params.electionId },
        select: { id: true, status: true },
      });

      if (!election) {
        throw new AppError('Election not found', 404, true, 'ELECTION_NOT_FOUND');
      }

      if (election.status !== 'PUBLISHED') {
        throw new AppError('Election is not active for voting', 400, true, 'ELECTION_NOT_ACTIVE');
      }

      // 2. Fetch credential and verify it hasn't been used
      const credential = await tx.anonymousCredential.findUnique({
        where: { credentialHash: params.credentialHash },
      });

      if (!credential) {
        throw new AppError('Invalid anonymous voting credential', 400, true, 'INVALID_CREDENTIAL');
      }

      if (credential.electionId !== params.electionId) {
        throw new AppError('Credential not valid for this election', 400, true, 'INVALID_CREDENTIAL');
      }

      if (credential.isUsed) {
        throw new AppError('Vote has already been cast using this credential', 409, true, 'DUPLICATE_VOTE');
      }

      // 3. Mark credential as used
      await tx.anonymousCredential.update({
        where: { id: credential.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });

      // 4. Create BlockchainTransaction record first or with ballot
      const blockchainTx = await tx.blockchainTransaction.create({
        data: {
          txId: params.txId,
          electionId: params.electionId,
          ballotHash: params.ballotHash,
          blockNumber: params.blockNumber,
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      });

      // 5. Create Ballot (ANONYMOUS: NO userId saved!)
      const ballot = await tx.ballot.create({
        data: {
          electionId: params.electionId,
          candidateId: params.candidateId,
          credentialHash: params.credentialHash,
          encryptedPayload: params.encryptedPayload,
          ballotHash: params.ballotHash,
          transactionId: blockchainTx.id,
        },
      });

      // 6. Record Audit log
      await tx.auditRecord.create({
        data: {
          eventType: 'BALLOT_CREATED',
          electionId: params.electionId,
          metadata: {
            ballotHash: params.ballotHash,
            txId: params.txId,
            blockNumber: params.blockNumber,
          },
        },
      });

      return { ballot, blockchainTx };
    });
  },

  async findReceiptByTxId(txId: string) {
    const blockchainTx = await prisma.blockchainTransaction.findUnique({
      where: { txId },
      include: {
        election: { select: { id: true, title: true, status: true } },
        ballot: { select: { ballotHash: true, createdAt: true } },
      },
    });

    if (!blockchainTx || !blockchainTx.ballot) return null;

    return {
      txId: blockchainTx.txId,
      electionId: blockchainTx.electionId,
      electionTitle: blockchainTx.election.title,
      ballotHash: blockchainTx.ballotHash,
      blockNumber: blockchainTx.blockNumber,
      status: blockchainTx.status,
      timestamp: blockchainTx.createdAt.getTime(),
    };
  },

  async getVotingStatus(userId: string, electionId: string) {
    const voterProfile = await prisma.voterProfile.findUnique({
      where: { userId },
    });
    if (!voterProfile) {
      return { eligible: false, hasVoted: false, credentialIssued: false };
    }

    const eligibility = await prisma.voterEligibility.findUnique({
      where: {
        voterProfileId_electionId: { voterProfileId: voterProfile.id, electionId },
      },
      include: { credential: true },
    });

    if (!eligibility || !eligibility.isEligible) {
      return { eligible: false, hasVoted: false, credentialIssued: false };
    }

    const credential = eligibility.credential;
    const hasVoted = credential ? credential.isUsed : false;

    return {
      eligible: true,
      hasVoted,
      credentialIssued: !!credential,
    };
  },
};
