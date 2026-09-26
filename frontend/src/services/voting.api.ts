import { apiClient } from './api';
import type { CastVoteRequest, CastVoteResponse, VoteReceipt } from '@/types';

/**
 * POST /api/v1/votes
 */
export async function castVote(data: CastVoteRequest): Promise<CastVoteResponse> {
  return apiClient<CastVoteResponse>('/votes', {
    method: 'POST',
    body: data,
  });
}

/**
 * GET /api/v1/votes/receipt/:txId
 */
export async function getReceipt(txId: string): Promise<VoteReceipt> {
  return apiClient<VoteReceipt>(`/votes/receipt/${encodeURIComponent(txId)}`, {
    method: 'GET',
  });
}

/** Alias helper for vote receipt lookup */
export const getVoteReceipt = getReceipt;
