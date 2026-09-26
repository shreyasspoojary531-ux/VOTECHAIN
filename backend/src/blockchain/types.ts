/** Types shared across the blockchain abstraction layer. */

export interface SubmitVoteInput {
  electionId: string;
  credentialId: string;
  candidateId: string;
  ballotHash: string;
}

export interface ChainTransaction {
  transactionId: string;
  blockNumber: number;
  timestamp: string;
  payload: SubmitVoteInput;
  channel: string;
  chaincode: string;
}

export interface Block {
  number: number;
  hash: string;
  previousHash: string;
  timestamp: string;
  transactionIds: string[];
}

export interface VerificationResult {
  valid: boolean;
  reason?: string;
  transaction?: ChainTransaction;
}
