import type { Request, Response } from "express";
import * as voteService from "../services/vote.service";
import { ok } from "../utils/response";
import { asyncHandler } from "../utils/asyncHandler";

/** POST /elections/:id/results — Admin declares results after close. */
export const declareResults = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await voteService.declareResults(req.params.id, req.user!.id, req.user!.role));
});
