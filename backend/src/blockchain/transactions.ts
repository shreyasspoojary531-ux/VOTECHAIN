/**
 * Chaincode transaction names used by the real Fabric deployment.
 * The simulated ledger bypasses these, but the naming contract is fixed now
 * so the chaincode (Go/TS) implements exactly these entrypoints.
 */
export const CHAINCODE_TXNS = {
  CAST_VOTE: "castVote",
  GET_VOTE: "getVote",
  GET_BLOCK: "getBlock",
  VERIFY_VOTE: "verifyVote",
} as const;
