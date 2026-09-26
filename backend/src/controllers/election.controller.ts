import type { Request, Response } from "express";
import * as electionService from "../services/election.service";
import { ok } from "../utils/response";
import { asyncHandler } from "../utils/asyncHandler";

export const createElection = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await electionService.createElection(req.body, req.user!.id, req.user!.role), 201);
});

export const listElections = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await electionService.listElections(req.query as { status?: string; constituency?: string }));
});

export const getElection = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await electionService.getElection(req.params.id));
});

export const patchElection = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await electionService.patchElection(req.params.id, req.body, req.user!.id, req.user!.role));
});

export const publishElection = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await electionService.publishElection(req.params.id, req.user!.id, req.user!.role));
});

export const activateElection = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await electionService.activateElection(req.params.id, req.user!.id, req.user!.role));
});

export const closeElection = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await electionService.closeElection(req.params.id, req.user!.id, req.user!.role));
});
