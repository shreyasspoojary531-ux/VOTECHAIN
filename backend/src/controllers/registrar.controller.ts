import type { Request, Response } from "express";
import * as registrarService from "../services/registrar.service";
import { ok } from "../utils/response";
import { asyncHandler } from "../utils/asyncHandler";

export const searchAadhaar = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await registrarService.searchAadhaar(req.query as { q?: string; constituency?: string }));
});

export const registerVoter = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await registrarService.registerVoter(req.body, req.user!.id, req.user!.role), 201);
});

export const listVoters = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await registrarService.listVoters(req.query as { constituency?: string }));
});
