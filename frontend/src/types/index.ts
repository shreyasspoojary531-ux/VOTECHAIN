/**
 * Shared domain types for the e-voting frontend.
 *
 * These are frontend-side contracts for the API v1 resources. They are
 * intentionally minimal for the scaffold phase — richer status enums,
 * pagination envelopes, etc. will be added as endpoints come online.
 */

export type Role = "REGISTRAR" | "VOTER" | "ADMIN" | "AUDITOR";

/** A citizen record identified by Aadhaar, awaiting or completed registration. */
export interface Voter {
  id: string;
  aadhaarLast4: string;
  name: string;
  /** Null until the registrar completes registration. */
  isRegistered: boolean;
  constituencyId: string;
  /** Epoch milliseconds. */
  registeredAt: number | null;
}

export interface Candidate {
  id: string;
  electionId: string;
  name: string;
  partyName: string;
  /** Optional candidate portrait/manifesto image URL. */
  imageUrl: string | null;
}

export type ElectionStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";

export interface Election {
  id: string;
  title: string;
  description: string;
  status: ElectionStatus;
  /** Epoch milliseconds. */
  startsAt: number;
  /** Epoch milliseconds. */
  endsAt: number;
  candidates: Candidate[];
}

/** A submitted ballot; the client never sees the vote content, only its receipt. */
export interface Vote {
  /** Blockchain transaction id of the committed ballot. */
  txId: string;
  electionId: string;
  /** Epoch milliseconds. */
  castAt: number;
  /** Blind signature receipt proving inclusion without revealing the ballot. */
  receiptHash: string;
}

export interface BlockchainTransaction {
  txId: string;
  /** Hash of the block that committed this transaction, null while pending. */
  blockHash: string | null;
  type: "VOTE" | "REGISTRATION" | "ELECTION_CREATE" | "RESULT_COMMIT";
  /** Epoch milliseconds. */
  timestamp: number;
  /** Opaque payload hash — payload contents are never exposed to clients. */
  payloadHash: string;
}

export interface Block {
  height: number;
  hash: string;
  previousHash: string;
  /** Epoch milliseconds. */
  timestamp: number;
  txCount: number;
  txIds: string[];
}

export interface AuditEvent {
  id: string;
  electionId: string;
  actorRole: Role;
  action: string;
  /** Epoch milliseconds. */
  timestamp: number;
  /** Correlates the event with a blockchain transaction where applicable. */
  txId: string | null;
}

/** Envelope for all list-returning endpoints (registrar search, blocks, etc.). */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
