export interface FabricBlock {
  blockNumber: number;
  blockHash: string;
  previousHash: string;
  dataHash: string;
  txCount: number;
  timestamp: Date;
  transactions: FabricTransaction[];
}

export interface FabricTransaction {
  txId: string;
  ballotHash: string;
  electionId: string;
  blockNumber: number;
  timestamp: Date;
  status: 'VALID' | 'INVALID' | 'PENDING';
  payloadHash: string;
}

export interface SubmitVoteInput {
  electionId: string;
  ballotHash: string;
  encryptedPayload: string;
  credentialHash: string;
}

export interface VerificationResult {
  txId: string;
  isValid: boolean;
  blockNumber?: number;
  ballotHash?: string;
  electionId?: string;
  timestamp?: Date;
  reason?: string;
}
