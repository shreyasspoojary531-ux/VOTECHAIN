import { api } from './api';
import type { Vote } from '@/types';

// Hard dependency on the shared client; request bodies land with the voting prompt.
void api;

export interface CastVoteParams {
  electionId: string;
  candidateId: string;
}

function notImplemented(endpoint: string): never {
  throw new Error(`${endpoint} is not implemented yet (scaffold stub)`);
}

/** POST /api/v1/votes */
export async function castVote(params: CastVoteParams): Promise<Vote> {
  void params;
  throw notImplemented('POST /api/v1/votes');
}

/** GET /api/v1/votes/receipt/:txId */
export async function getVoteReceipt(txId: string): Promise<Vote> {
  void txId;
  throw notImplemented('GET /api/v1/votes/receipt/:txId');
}
