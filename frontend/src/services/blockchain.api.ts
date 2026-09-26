import { api } from './api';
import type { Block, BlockchainTransaction, Paginated } from '@/types';

// Hard dependency on the shared client; request bodies land with the explorer prompt.
void api;

export interface ListBlocksParams {
  page?: number;
  pageSize?: number;
}

function notImplemented(endpoint: string): never {
  throw new Error(`${endpoint} is not implemented yet (scaffold stub)`);
}

/** GET /api/v1/blockchain/blocks */
export async function listBlocks(params?: ListBlocksParams): Promise<Paginated<Block>> {
  void params;
  throw notImplemented('GET /api/v1/blockchain/blocks');
}

/** GET /api/v1/blockchain/transactions/:txId */
export async function getTransaction(txId: string): Promise<BlockchainTransaction> {
  void txId;
  throw notImplemented('GET /api/v1/blockchain/transactions/:txId');
}
