import { api } from "./api";
import type { Paginated, Voter } from "@/types";

// Hard dependency on the shared client; request bodies land with the registrar prompt.
void api;

export interface AadhaarSearchParams {
  query: string;
  page?: number;
  pageSize?: number;
}

export interface RegisterVoterParams {
  aadhaar: string;
  name: string;
  constituencyId: string;
}

function notImplemented(endpoint: string): never {
  throw new Error(`${endpoint} is not implemented yet (scaffold stub)`);
}

/** GET /api/v1/registrar/aadhaar/search */
export async function searchAadhaar(params: AadhaarSearchParams): Promise<Paginated<Voter>> {
  void params;
  throw notImplemented("GET /api/v1/registrar/aadhaar/search");
}

/** POST /api/v1/registrar/register-voter */
export async function registerVoter(params: RegisterVoterParams): Promise<Voter> {
  void params;
  throw notImplemented("POST /api/v1/registrar/register-voter");
}
