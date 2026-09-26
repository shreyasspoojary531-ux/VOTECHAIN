import jwt from "jsonwebtoken";
import { config } from "../config";

/**
 * JWT contains ONLY userId, role, email.
 * Never include: password, aadhaar, phone, constituency, candidate/ballot data.
 */
export interface JwtPayload {
  userId: string;
  role: string;
  email: string;
}

export function sign(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
}

export function verify(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}
