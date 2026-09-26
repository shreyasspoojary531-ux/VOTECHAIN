import { fabricService } from '../blockchain/fabric.service';
import { blockchainRepository } from '../repositories/blockchain.repository';
import { AppError } from '../middleware/errorHandler';

export const blockchainService = {
  async getBlocks() {
    const fabricBlocks = await fabricService.getBlocks();
    return fabricBlocks.map((b) => ({
      blockNumber: b.blockNumber,
      blockHash: b.blockHash,
      previousHash: b.previousHash,
      dataHash: b.dataHash,
      txCount: b.txCount,
      timestamp: b.timestamp.getTime(),
    }));
  },

  async getBlockByNumber(number: number) {
    const block = await fabricService.getBlock(number);
    if (!block) {
      throw new AppError('Block not found', 404, true, 'BLOCK_NOT_FOUND');
    }
    return {
      blockNumber: block.blockNumber,
      blockHash: block.blockHash,
      previousHash: block.previousHash,
      dataHash: block.dataHash,
      txCount: block.txCount,
      timestamp: block.timestamp.getTime(),
      transactions: block.transactions.map((tx) => ({
        txId: tx.txId,
        ballotHash: tx.ballotHash,
        electionId: tx.electionId,
        status: tx.status,
        timestamp: tx.timestamp.getTime(),
      })),
    };
  },

  async getTransactionByTxId(txId: string) {
    const tx = await fabricService.getTransaction(txId);
    const dbTx = await blockchainRepository.findByTxId(txId);

    if (!tx && !dbTx) {
      throw new AppError('Transaction not found', 404, true, 'TRANSACTION_NOT_FOUND');
    }

    return {
      txId: txId,
      electionId: tx?.electionId || dbTx?.electionId || '',
      electionTitle: dbTx?.election?.title || 'VoteChain Election',
      ballotHash: tx?.ballotHash || dbTx?.ballotHash || '',
      blockNumber: tx?.blockNumber ?? dbTx?.blockNumber ?? 1,
      status: tx?.status || dbTx?.status || 'CONFIRMED',
      timestamp: (tx?.timestamp || dbTx?.createdAt || new Date()).getTime(),
    };
  },

  async verifyTransaction(txId: string) {
    const result = await fabricService.verifyTransaction(txId);
    return {
      txId: result.txId,
      isValid: result.isValid,
      blockNumber: result.blockNumber,
      ballotHash: result.ballotHash,
      electionId: result.electionId,
      timestamp: result.timestamp ? result.timestamp.getTime() : undefined,
      reason: result.reason,
    };
  },
};
