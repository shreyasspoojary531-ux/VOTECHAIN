import type { Request, Response } from "express";
import * as fabric from "../blockchain/fabric.service";
import { ok, fail } from "../utils/response";
import { asyncHandler } from "../utils/asyncHandler";

export const listBlocks = asyncHandler(async (_req: Request, res: Response) => {
  ok(res, await fabric.getAllBlocks());
});

export const getBlock = asyncHandler(async (req: Request, res: Response) => {
  const block = await fabric.getBlock(Number(req.params.number));
  if (!block) {
    fail(res, 404, "BLOCK_NOT_FOUND", "Block not found");
    return;
  }
  ok(res, block);
});

export const getTransaction = asyncHandler(async (req: Request, res: Response) => {
  const tx = await fabric.getTransaction(req.params.txId);
  if (!tx) {
    fail(res, 404, "TX_NOT_FOUND", "Transaction not found");
    return;
  }
  ok(res, tx);
});

export const verifyTransaction = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await fabric.verifyTransaction(req.params.txId));
});
