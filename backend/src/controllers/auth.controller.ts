import type { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { AuthError } from "../services/auth.service";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    res.status(201).json(await authService.register(email, password));
  } catch (err) {
    handleError(res, err);
  }
}

export async function sendOtp(req: Request, res: Response): Promise<void> {
  try {
    const { email, purpose } = req.body;
    res.json(await authService.sendOtpFor(email, purpose));
  } catch (err) {
    handleError(res, err);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    res.json(await authService.login(email, password));
  } catch (err) {
    handleError(res, err);
  }
}

export async function verifyOtp(req: Request, res: Response): Promise<void> {
  try {
    const { email, code, purpose } = req.body;
    const result = await authService.verifyOtp(email, code, purpose);
    if (result.activated) {
      res.json({ message: result.message });
    } else {
      res.json({ token: result.token, user: result.user });
    }
  } catch (err) {
    handleError(res, err);
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  try {
    const user = await authService.getCurrentUser(req.user!.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ id: user.id, email: user.email, role: user.role, isActive: user.isActive });
  } catch (err) {
    handleError(res, err);
  }
}

function handleError(res: Response, err: unknown): void {
  if (err instanceof AuthError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  throw err;
}
