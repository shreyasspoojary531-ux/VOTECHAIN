import { api } from "./api";
import type { Role } from "@/types";

// Hard dependency on the shared client; request bodies land with the auth prompt.
void api;

export interface RegisterParams {
  aadhaar: string;
  name: string;
  password: string;
}

export interface LoginParams {
  aadhaar: string;
  password: string;
}

/** Returned by login / verify-otp once the session is fully established. */
export interface AuthSession {
  accessToken: string;
  userId: string;
  /** Role is assigned server-side and drives role-based navigation. */
  role: Role;
}

export interface RegisterResult {
  userId: string;
}

function notImplemented(endpoint: string): never {
  throw new Error(`${endpoint} is not implemented yet (scaffold stub)`);
}

/** POST /api/v1/auth/register */
export async function register(params: RegisterParams): Promise<RegisterResult> {
  void params;
  throw notImplemented("POST /api/v1/auth/register");
}

/** POST /api/v1/auth/login */
export async function login(params: LoginParams): Promise<AuthSession> {
  void params;
  throw notImplemented("POST /api/v1/auth/login");
}
