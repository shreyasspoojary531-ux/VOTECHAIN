import type { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { fail, ok } from "../utils/response";
import { asyncHandler } from "../utils/asyncHandler";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  ok(res, await authService.register(email, password), 201);
});

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, purpose } = req.body;
  ok(res, await authService.sendOtpFor(email, purpose));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  ok(res, await authService.login(email, password));
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, code, purpose } = req.body;
  const result = await authService.verifyOtp(email, code, purpose);
  if (result.activated) {
    ok(res, { message: result.message });
  } else {
    ok(res, { token: result.token, user: result.user });
  }
});

/** Requires authenticate() — userId comes from the token. */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  ok(res, await authService.logout(req.user!.id, token));
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.id);
  if (!user) {
    fail(res, 404, "USER_NOT_FOUND", "User not found");
    return;
  }
  ok(res, user);
});
