import { auditRepository } from '../repositories/audit.repository';
import { fabricService } from '../blockchain/fabric.service';
import { AppError } from '../middleware/errorHandler';

export const auditService = {
  async getAuditElections() {
    return auditRepository.getAuditElections();
  },

  async getElectionAuditReport(electionId: string) {
    const report = await auditRepository.getElectionAudit(electionId);
    if (!report) {
      throw new AppError('Election not found for audit', 404, true, 'ELECTION_NOT_FOUND');
    }
    return report;
  },

  async verifyElectionChain(electionId: string) {
    const report = await auditRepository.getElectionAudit(electionId);
    if (!report) {
      throw new AppError('Election not found', 404, true, 'ELECTION_NOT_FOUND');
    }

    const blocks = await fabricService.getBlocks();
    const isChainConsistent = blocks.every((block, idx) => {
      if (idx === blocks.length - 1) return true;
      const prev = blocks[idx + 1];
      return block.previousHash === prev.blockHash;
    });

    return {
      electionId,
      totalBallots: report.totalBallots,
      totalTransactions: report.totalTransactions,
      isIntegrityVerified: report.isIntegrityVerified && isChainConsistent,
      isChainConsistent,
      verifiedAt: Date.now(),
    };
  },
};
