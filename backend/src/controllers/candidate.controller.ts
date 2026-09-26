import type { Request, Response } from "express";
import * as candidateService from "../services/candidate.service";
import { ok } from "../utils/response";
import { asyncHandler } from "../utils/asyncHandler";

export const listCandidates = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await candidateService.listCandidates(req.params.id));
});

export const addCandidate = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await candidateService.addCandidate(req.params.id, req.body, req.user!.id, req.user!.role), 201);
});

export const patchCandidate = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await candidateService.patchCandidate(req.params.candidateId, req.body, req.user!.id, req.user!.role));
});

export const deleteCandidate = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await candidateService.removeCandidate(req.params.candidateId, req.user!.id, req.user!.role));
});
