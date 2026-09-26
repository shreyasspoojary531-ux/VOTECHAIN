import { api } from "./api";
import type { Candidate, Election, ElectionStatus, Paginated } from "@/types";

// Hard dependency on the shared client; request bodies land with the elections prompt.
void api;

export interface ListElectionsParams {
  status?: ElectionStatus;
  page?: number;
  pageSize?: number;
}

export interface CreateElectionParams {
  title: string;
  description: string;
  /** Epoch milliseconds. */
  startsAt: number;
  /** Epoch milliseconds. */
  endsAt: number;
  /** Candidates are supplied inline; there is no standalone candidate endpoint in API v1. */
  candidates: Array<Pick<Candidate, "name" | "partyName">>;
}

function notImplemented(endpoint: string): never {
  throw new Error(`${endpoint} is not implemented yet (scaffold stub)`);
}

/** GET /api/v1/elections */
export async function listElections(params?: ListElectionsParams): Promise<Paginated<Election>> {
  void params;
  throw notImplemented("GET /api/v1/elections");
}

/** POST /api/v1/elections */
export async function createElection(params: CreateElectionParams): Promise<Election> {
  void params;
  throw notImplemented("POST /api/v1/elections");
}
