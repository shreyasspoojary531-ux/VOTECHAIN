import { fabricGateway } from './fabric.gateway';
import { FabricBlock, FabricTransaction, SubmitVoteInput, VerificationResult } from './types';

/**
 * Fabric Service Layer.
 * Strictly exposes ONLY submitVote, getTransaction, getBlock, and verifyTransaction.
 * No controller or other service should access Fabric SDK directly.
 */
export class FabricService {
  async submitVote(input: SubmitVoteInput): Promise<{ txId: string; blockNumber: number }> {
    return fabricGateway.submitTransaction(input);
  }

  async getTransaction(txId: string): Promise<FabricTransaction | null> {
    return fabricGateway.getTransaction(txId);
  }

  async getBlock(blockNumber: number): Promise<FabricBlock | null> {
    return fabricGateway.getBlock(blockNumber);
  }

  async getBlocks(): Promise<FabricBlock[]> {
    return fabricGateway.getBlocks();
  }

  async verifyTransaction(txId: string): Promise<VerificationResult> {
    return fabricGateway.verifyTransaction(txId);
  }
}

export const fabricService = new FabricService();
