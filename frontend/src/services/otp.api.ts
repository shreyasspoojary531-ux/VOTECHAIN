import { api } from "./api";
import type { AuthSession } from "./auth.api";

// Hard dependency on the shared client; request bodies land with the OTP prompt.
void api;

export interface SendOtpParams {
  aadhaar: string;
}

export interface SendOtpResult {
  /** Masked destination, e.g. "+91 ------ 4321", for UI confirmation only. */
  maskedDestination: string;
  expiresInSeconds: number;
}

export interface VerifyOtpParams {
  aadhaar: string;
  code: string;
}

function notImplemented(endpoint: string): never {
  throw new Error(`${endpoint} is not implemented yet (scaffold stub)`);
}

/** POST /api/v1/auth/send-otp */
export async function sendOtp(params: SendOtpParams): Promise<SendOtpResult> {
  void params;
  throw notImplemented("POST /api/v1/auth/send-otp");
}

/** POST /api/v1/auth/verify-otp */
export async function verifyOtp(params: VerifyOtpParams): Promise<AuthSession> {
  void params;
  throw notImplemented("POST /api/v1/auth/verify-otp");
}
