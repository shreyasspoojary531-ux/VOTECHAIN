import { apiClient } from './api';
import type { Block, Transaction, Paginated } from '@/types';

export interface ListBlocksParams {
  page?: number;
  pageSize?: number;
}

/**
 * GET /api/v1/blockchain/blocks
 */
export async function getBlocks(): Promise<Block[]> {
  const result = await apiClient<Block[] | Paginated<Block>>('/blockchain/blocks', {
    method: 'GET',
  });
  if (Array.isArray(result)) {
    return result;
  }
  return result?.items || [];
}

/**
 * GET /api/v1/blockchain/blocks (paginated helper)
 */
export async function listBlocks(params?: ListBlocksParams): Promise<Paginated<Block>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.pageSize) query.set('pageSize', String(params.pageSize));

  const path = `/blockchain/blocks${query.toString() ? `?${query.toString()}` : ''}`;
  const result = await apiClient<Paginated<Block> | Block[]>(path, { method: 'GET' });

  if (Array.isArray(result)) {
    return {
      items: result,
      total: result.length,
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
    };
  }
  return result;
}

/**
 * GET /api/v1/blockchain/blocks/:blockId
 */
export async function getBlockById(blockId: string): Promise<Block> {
  return apiClient<Block>(`/blockchain/blocks/${encodeURIComponent(blockId)}`, {
    method: 'GET',
  });
}

/**
 * GET /api/v1/blockchain/transactions/:txId
 */
export async function getTransaction(txId: string): Promise<Transaction> {
  return apiClient<Transaction>(`/blockchain/transactions/${encodeURIComponent(txId)}`, {
    method: 'GET',
  });
}
