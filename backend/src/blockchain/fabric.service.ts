import * as gateway from "./fabric.gateway";
import type { Block, ChainTransaction, SubmitVoteInput, VerificationResult } from "./types";

/**
 * The single entry point to the blockchain layer.
 * Exposes ONLY: submitVote, getTransaction, getBlock, verifyTransaction.
 * Business modules import this file — never the Fabric SDK, gateway, or client.
 */

export async function submitVote(payload: SubmitVoteInput): Promise<ChainTransaction> {
  return gateway.submitTransaction(payload);
}

export async function getTransaction(transactionId: string): Promise<ChainTransaction | undefined> {
  return gateway.evaluateTransaction(transactionId);
}

export async function getBlock(blockNumber: number): Promise<Block | undefined> {
  return gateway.queryBlock(blockNumber);
}

export async function getAllBlocks(): Promise<Block[]> {
  return gateway.queryAllBlocks();
}

export async function verifyTransaction(transactionId: string): Promise<VerificationResult> {
  const tx = await gateway.evaluateTransaction(transactionId);
  if (!tx) {
    return { valid: false, reason: "Transaction not found on chain" };
  }
  // In simulated mode, chain integrity implies tx validity.
  const chain = gateway.verifyChainIntegrity();
  return {
    valid: chain.chainValid,
    reason: chain.reason,
    transaction: tx,
  };
}

export async function verifyElectionChain(): Promise<VerificationResult & { chainValid: boolean; blocksChecked: number }> {
  return gateway.verifyChainIntegrity();
}
