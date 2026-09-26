import crypto from "crypto";
import type { Block, ChainTransaction, SubmitVoteInput } from "./types";

/**
 * SIMULATED Fabric ledger (demo mode).
 *
 * A real deployment replaces this file with the actual Fabric SDK peer/gateway
 * connection — nothing outside src/blockchain knows the difference because the
 * gateway/service expose only submitVote/getTransaction/getBlock/verifyTransaction.
 *
 * The ledger is append-only and hash-chained: each block references the
 * previous block's hash, so tampering is detectable by re-walking the chain.
 */

export interface StoredTx extends ChainTransaction {
  payload: SubmitVoteInput;
}

const blocks: Block[] = [];
const txs = new Map<string, StoredTx>();

function genesisBlock(): Block {
  return {
    number: 0,
    hash: crypto.createHash("sha256").update("votechain-genesis").digest("hex"),
    previousHash: "0".repeat(64),
    timestamp: new Date().toISOString(),
    transactionIds: [],
  };
}

blocks.push(genesisBlock());

export function appendTransaction(payload: SubmitVoteInput): StoredTx {
  const transactionId = `tx-${crypto.randomUUID()}`;
  const prev = blocks[blocks.length - 1];

  // ~10 txs per block, like a real batching peer.
  let currentBlock = prev.transactionIds.length < 10 ? prev : null;
  if (!currentBlock) {
    currentBlock = {
      number: prev.number + 1,
      hash: "",
      previousHash: prev.hash,
      timestamp: new Date().toISOString(),
      transactionIds: [],
    };
    blocks.push(currentBlock);
  }

  const tx: StoredTx = {
    transactionId,
    blockNumber: currentBlock.number,
    timestamp: new Date().toISOString(),
    payload,
    channel: process.env.FABRIC_CHANNEL ?? "votechannel",
    chaincode: process.env.FABRIC_CHAINCODE ?? "votechain",
  };

  currentBlock.transactionIds.push(transactionId);
  currentBlock.hash = crypto
    .createHash("sha256")
    .update(`${currentBlock.previousHash}|${currentBlock.transactionIds.join(",")}`)
    .digest("hex");

  txs.set(transactionId, tx);
  return tx;
}

export function getTransaction(transactionId: string): StoredTx | undefined {
  return txs.get(transactionId);
}

export function getBlock(number: number): Block | undefined {
  return blocks.find((b) => b.number === number);
}

export function getAllBlocks(): Block[] {
  return [...blocks];
}

export function getChainHeight(): number {
  return blocks.length;
}

export function getStats(): { txCount: number; blockCount: number } {
  return { txCount: txs.size, blockCount: blocks.length };
}
