import { AppError } from '../middleware/errorHandler';
import { credentialRepository } from '../repositories/credential.repository';
import { votingRepository } from '../repositories/voting.repository';
import { fabricService } from '../blockchain/fabric.service';
import { formatBallotHash, logTransactionSubmitted } from '../blockchain/transactions';
import { prisma } from '../utils/prisma';

export interface CastVoteInput {
  electionId: string;
  candidateId: string;
  credentialHash: string;
  encryptedPayload?: string;
}

export const votingService = {
  /** Issue anonymous credential for voter eligibility in an election */
  async issueCredential(userId: string, electionId: string) {
    const voterProfile = await prisma.voterProfile.findUnique({
      where: { userId },
    });

    if (!voterProfile) {
      throw new AppError('Voter profile not registered', 403, true, 'VOTER_NOT_REGISTERED');
    }

    const credential = await credentialRepository.getOrCreateCredential(voterProfile.id, electionId);

    if (credential.isUsed) {
      throw new AppError('Vote already cast with this credential', 409, true, 'DUPLICATE_VOTE');
    }

    return {
      credentialHash: credential.credentialHash,
      electionId: credential.electionId,
      issuedAt: credential.issuedAt.getTime(),
    };
  },

  /** Submit anonymous ballot to blockchain & Prisma database */
  async castVote(userId: string, input: CastVoteInput) {
    const { electionId, candidateId, credentialHash } = input;
    const encryptedPayload = input.encryptedPayload || 'ENCRYPTED_BALLOT_PAYLOAD';

    // 1. Verify candidate exists in election
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });
    if (!candidate || candidate.electionId !== electionId) {
      throw new AppError('Invalid candidate for election', 400, true, 'INVALID_CANDIDATE');
    }

    // 2. Format cryptographic ballot hash
    const ballotHash = formatBallotHash(electionId, candidateId, credentialHash);

    // 3. Submit transaction to Fabric blockchain layer
    const fabricResult = await fabricService.submitVote({
      electionId,
      ballotHash,
      encryptedPayload,
      credentialHash,
    });

    // 4. Run atomic Prisma transaction (updates credential, saves ballot & transaction)
    const { blockchainTx } = await votingRepository.submitVoteAtomic({
      electionId,
      candidateId,
      credentialHash,
      ballotHash,
      encryptedPayload,
      txId: fabricResult.txId,
      blockNumber: fabricResult.blockNumber,
    });

    logTransactionSubmitted(blockchainTx.txId, electionId);

    return {
      txId: blockchainTx.txId,
      blockNumber: blockchainTx.blockNumber,
      ballotHash,
      status: blockchainTx.status,
      timestamp: blockchainTx.createdAt.getTime(),
    };
  },

  /** Check if user is eligible / has voted */
  async getVotingStatus(userId: string, electionId: string) {
    return votingRepository.getVotingStatus(userId, electionId);
  },

  /** Fetch vote verification receipt */
  async getReceipt(txId: string) {
    const receipt = await votingRepository.findReceiptByTxId(txId);
    if (!receipt) {
      throw new AppError('Vote transaction receipt not found', 404, true, 'RECEIPT_NOT_FOUND');
    }
    return receipt;
  },
};
