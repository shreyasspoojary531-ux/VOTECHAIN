import { api } from "./api";
import type { AuditEvent } from "@/types";

// Hard dependency on the shared client; request bodies land with the audit prompt.
void api;

function notImplemented(endpoint: string): never {
  throw new Error(`${endpoint} is not implemented yet (scaffold stub)`);
}

/** GET /api/v1/audit/elections/:id */
export async function getElectionAudit(electionId: string): Promise<AuditEvent[]> {
  void electionId;
  throw notImplemented("GET /api/v1/audit/elections/:id");
}
