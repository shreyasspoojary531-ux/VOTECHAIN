import crypto from 'crypto';
import { fabricClient } from './fabric.client';
import { FabricBlock, FabricTransaction, SubmitVoteInput, VerificationResult } from './types';
import { logger } from '../utils/logger';

/**
 * Hyperledger Fabric Gateway isolation.
 * Encapsulates chaincode invocation & query operations.
 */
export class FabricGateway {
  private blocks: Map<number, FabricBlock> = new Map();
  private transactions: Map<string, FabricTransaction> = new Map();
  private currentBlockNumber: number = 1;

  constructor() {
    this.seedGenesisBlock();
  }

  private seedGenesisBlock() {
    const genesisHash = crypto.createHash('sha256').update('GENESIS_BLOCK_VOTECHAIN').digest('hex');
    const genesisBlock: FabricBlock = {
      blockNumber: 0,
      blockHash: genesisHash,
      previousHash: '0'.repeat(64),
      dataHash: genesisHash,
      txCount: 0,
      timestamp: new Date('2026-01-01T00:00:00Z'),
      transactions: [],
    };
    this.blocks.set(0, genesisBlock);
  }

  async submitTransaction(input: SubmitVoteInput): Promise<{ txId: string; blockNumber: number }> {
    await fabricClient.connect();

    const txId = 'tx_' + crypto.randomBytes(16).toString('hex');
    const timestamp = new Date();
    const payloadHash = crypto
      .createHash('sha256')
      .update(`${input.electionId}:${input.ballotHash}:${input.encryptedPayload}`)
      .digest('hex');

    const blockNumber = this.currentBlockNumber;

    const fabricTx: FabricTransaction = {
      txId,
      ballotHash: input.ballotHash,
      electionId: input.electionId,
      blockNumber,
      timestamp,
      status: 'VALID',
      payloadHash,
    };

    this.transactions.set(txId, fabricTx);

    // Create a new block or append to block
    const prevBlock = this.blocks.get(blockNumber - 1) || this.blocks.get(0)!;
    const blockHash = crypto
      .createHash('sha256')
      .update(`${blockNumber}:${prevBlock.blockHash}:${txId}:${timestamp.toISOString()}`)
      .digest('hex');

    const block: FabricBlock = {
      blockNumber,
      blockHash,
      previousHash: prevBlock.blockHash,
      dataHash: payloadHash,
      txCount: 1,
      timestamp,
      transactions: [fabricTx],
    };

    this.blocks.set(blockNumber, block);
    this.currentBlockNumber++;

    logger.info(`Fabric transaction submitted: txId=${txId}, blockNumber=${blockNumber}`);
    return { txId, blockNumber };
  }

  async getTransaction(txId: string): Promise<FabricTransaction | null> {
    await fabricClient.connect();
    return this.transactions.get(txId) || null;
  }

  async getBlock(blockNumber: number): Promise<FabricBlock | null> {
    await fabricClient.connect();
    return this.blocks.get(blockNumber) || null;
  }

  async getBlocks(): Promise<FabricBlock[]> {
    await fabricClient.connect();
    return Array.from(this.blocks.values()).sort((a, b) => b.blockNumber - a.blockNumber);
  }

  async verifyTransaction(txId: string): Promise<VerificationResult> {
    await fabricClient.connect();
    const tx = this.transactions.get(txId);
    if (!tx) {
      return { txId, isValid: false, reason: 'TRANSACTION_NOT_FOUND' };
    }

    const block = this.blocks.get(tx.blockNumber);
    if (!block) {
      return { txId, isValid: false, reason: 'BLOCK_NOT_FOUND' };
    }

    return {
      txId,
      isValid: tx.status === 'VALID',
      blockNumber: tx.blockNumber,
      ballotHash: tx.ballotHash,
      electionId: tx.electionId,
      timestamp: tx.timestamp,
    };
  }
}

export const fabricGateway = new FabricGateway();
