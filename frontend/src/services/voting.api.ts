import { apiClient } from './api';
import type { CastVoteRequest, CastVoteResponse, VoteReceipt } from '@/types';

/**
 * POST /api/v1/votes/credential — Issue anonymous voting credential for election
 */
export async function issueCredential(electionId: string): Promise<{ credentialHash: string }> {
  return apiClient<{ credentialHash: string }>('/votes/credential', {
    method: 'POST',
    body: { electionId },
  });
}

/**
 * POST /api/v1/votes — Cast anonymous vote
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
