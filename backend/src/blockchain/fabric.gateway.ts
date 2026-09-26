import { config } from "../config";
import * as simulated from "./fabric.client";
import type { Block, ChainTransaction, SubmitVoteInput, VerificationResult } from "./types";

/**
 * Gateway boundary. When config.fabric.simulated is false, a real deployment
 * swaps these implementations for Fabric SDK gateway calls (submit/evaluate
 * against FABRIC_CHANNEL + FABRIC_CHAINCODE). The rest of the backend only
 * ever talks to fabric.service, never to the SDK or this file.
 */

export async function submitTransaction(payload: SubmitVoteInput): Promise<ChainTransaction> {
  if (config.fabric.simulated) {
    return simulated.appendTransaction(payload);
  }
  // Real Fabric path (not scaffolded in the MVP):
  // const gateway = await connect(config.fabric.networkPath);
  // const network = await gateway.getNetwork(config.fabric.channel);
  // const contract = network.getContract(config.fabric.chaincode);
  // await contract.submitTransaction("castVote", JSON.stringify(payload));
  throw new Error("Real Fabric network not configured in MVP — set SIMULATED_BLOCKCHAIN=true");
}

export async function evaluateTransaction(transactionId: string): Promise<ChainTransaction | undefined> {
  if (config.fabric.simulated) {
    return simulated.getTransaction(transactionId);
  }
  throw new Error("Real Fabric network not configured in MVP — set SIMULATED_BLOCKCHAIN=true");
}

export async function queryBlock(number: number): Promise<Block | undefined> {
  if (config.fabric.simulated) {
    return simulated.getBlock(number);
  }
  throw new Error("Real Fabric network not configured in MVP — set SIMULATED_BLOCKCHAIN=true");
}

export async function queryAllBlocks(): Promise<Block[]> {
  if (config.fabric.simulated) {
    return simulated.getAllBlocks();
  }
  throw new Error("Real Fabric network not configured in MVP — set SIMULATED_BLOCKCHAIN=true");
}

export function verifyChainIntegrity(): VerificationResult & { chainValid: boolean; blocksChecked: number } {
  const blocks = simulated.getAllBlocks();
  for (let i = 1; i < blocks.length; i++) {
    const recomputed = require("crypto")
      .createHash("sha256")
      .update(`${blocks[i].previousHash}|${blocks[i].transactionIds.join(",")}`)
      .digest("hex");
    if (recomputed !== blocks[i].hash) {
      return { valid: false, chainValid: false, blocksChecked: blocks.length, reason: `Block ${blocks[i].number} hash mismatch` };
    }
    if (blocks[i].previousHash !== blocks[i - 1].hash) {
      return { valid: false, chainValid: false, blocksChecked: blocks.length, reason: `Block ${blocks[i].number} broken previousHash link` };
    }
  }
  return { valid: true, chainValid: true, blocksChecked: blocks.length };
}
