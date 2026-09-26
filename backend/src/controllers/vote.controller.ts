import type { Request, Response } from "express";
import * as voteService from "../services/vote.service";
import { ok } from "../utils/response";
import { asyncHandler } from "../utils/asyncHandler";

export const requestCredential = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await voteService.requestCredential(req.body.electionId, req.user!.id, req.user!.role), 201);
});

export const castVote = asyncHandler(async (req: Request, res: Response) => {
  const { credential, candidateId } = req.body;
  ok(res, await voteService.castVote(credential, candidateId, req.user!.id, req.user!.role), 201);
});

export const voteStatus = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await voteService.voteStatus(req.user!.id));
});

export const getReceipt = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await voteService.getReceipt(req.params.txId, req.user!.id));
});
