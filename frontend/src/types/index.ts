/**
 * Shared domain types for the e-voting platform frontend API v1 surface.
 */

// User & Role
export type Role = 'REGISTRAR' | 'VOTER' | 'ADMIN' | 'AUDITOR';

export interface User {
  id: string;
  name?: string;
  role: Role;
  email: string;
  aadhaarLast4?: string;
  isActive?: boolean;
  createdAt?: string;
}

// Auth
export interface RegisterRequest {
  name?: string;
  email: string;
  password: string;
  aadhaarNumber?: string;
  role?: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  jwt: string | null;
  user: User;
  otpRequired: boolean;
  pendingToken: string | null;
  devOtp: string | null;
}

export interface SendOtpRequest {
  identifier: string;
}

export interface VerifyOtpRequest {
  identifier: string;
  otp: string;
}

export interface VerifyOtpResponse {
  verified: boolean;
  sessionToken?: string;
}

// Registrar
export interface AadhaarSearchQuery {
  aadhaarNumber: string;
}

export interface AadhaarSearchResult {
  aadhaarLast4: string;
  isRegistered: boolean;
  voterId?: string;
  name?: string;
  constituencyId?: string;
}

export interface RegisterVoterRequest {
  aadhaarNumber: string;
  name: string;
  constituencyId: string;
}

export interface RegisterVoterResponse {
  voterId: string;
  isRegistered: boolean;
  registeredAt: number;
}

/** Legacy / general voter model interface */
export interface Voter {
  id: string;
  aadhaarLast4: string;
  name: string;
  isRegistered: boolean;
  constituencyId: string;
  registeredAt: number | null;
}

// Election
export interface Candidate {
  id: string;
  name: string;
  partyName: string;
  imageUrl?: string | null;
}

export type ElectionStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

export interface Election {
  id: string;
  title: string;
  description: string;
  status: ElectionStatus;
  startsAt: number;
  endsAt: number;
  candidates: Candidate[];
}

export interface CreateElectionRequest {
  title: string;
  description: string;
  startsAt: number;
  endsAt: number;
  candidates: Array<{
    name: string;
    partyName: string;
    imageUrl?: string | null;
  }>;
}

// Voting
export interface CastVoteRequest {
  electionId: string;
  candidateId: string;
  voterId: string;
}

export interface CastVoteResponse {
  txId: string;
  receiptHash: string;
  timestamp: number;
}

export interface VoteReceipt {
  txId: string;
  electionId: string;
  receiptHash: string;
  castAt: number;
  blockHash?: string;
}

/** Legacy Vote alias */
export interface Vote {
  txId: string;
  electionId: string;
  castAt: number;
  receiptHash: string;
}

// Blockchain
export interface Transaction {
  txId: string;
  blockHash: string | null;
  type: 'VOTE' | 'REGISTRATION' | 'ELECTION_CREATE' | 'RESULT_COMMIT';
  timestamp: number;
  payloadHash: string;
}

export type BlockchainTransaction = Transaction;

export interface Block {
  height: number;
  hash: string;
  previousHash: string;
  timestamp: number;
  txCount: number;
  txIds: string[];
  transactions?: Transaction[];
}

// Audit
export interface ElectionAuditReport {
  electionId: string;
  totalVotesCast: number;
  validVotesCount: number;
  invalidVotesCount: number;
  chainIntegrityVerified: boolean;
  discrepancies: string[];
  lastAuditTimestamp: number;
}

export interface AuditEvent {
  id: string;
  electionId: string;
  actorRole: Role;
  action: string;
  timestamp: number;
  txId: string | null;
}

// Envelopes
export interface Paginated<T> {
  items: T[];
  data?: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}
