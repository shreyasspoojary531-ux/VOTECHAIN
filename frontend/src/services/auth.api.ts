import { apiClient } from './api';
import { clearToken } from '@/lib/auth-token';
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types';

/**
 * Raw backend login data shape (after apiClient auto-unwraps the { success, data } envelope).
 * Staff roles get jwt directly; voters get otpRequired + pendingToken.
 */
interface RawLoginData {
  jwt: string | null;
  user: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  };
  otpRequired: boolean;
  pendingToken: string | null;
  devOtp: string | null;
}

/**
 * POST /api/v1/auth/register
 */
export async function register(data: RegisterRequest): Promise<unknown> {
  return apiClient<unknown>('/auth/register', {
    method: 'POST',
    body: data,
  });
}

/**
 * POST /api/v1/auth/login
 *
 * apiClient auto-unwraps the { success, data } envelope, so we receive
 * the raw login data directly. We normalize it to the frontend's LoginResponse shape.
 * No demo fallback — real errors (wrong password, etc.) propagate to the caller.
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const raw = await apiClient<RawLoginData>('/auth/login', {
    method: 'POST',
    body: data,
  });

  return {
    jwt: raw.jwt,
    user: {
      id: raw.user.id,
      name: raw.user.email.split('@')[0], // derive display name from email
      email: raw.user.email,
      role: raw.user.role as LoginResponse['user']['role'],
    },
    otpRequired: raw.otpRequired,
    pendingToken: raw.pendingToken,
    devOtp: raw.devOtp,
  };
}

/**
 * POST /api/v1/auth/send-otp
 */
export async function sendOtp(pendingToken: string): Promise<{ sent: boolean; devOtp: string | null }> {
  return apiClient<{ sent: boolean; devOtp: string | null }>('/auth/send-otp', {
    method: 'POST',
    body: { pendingToken },
  });
}

/**
 * POST /api/v1/auth/verify-otp
 */
export async function verifyOtp(pendingToken: string, otp: string): Promise<LoginResponse> {
  const raw = await apiClient<RawLoginData>('/auth/verify-otp', {
    method: 'POST',
    body: { pendingToken, otp },
  });

  return {
    jwt: raw.jwt,
    user: {
      id: raw.user.id,
      name: raw.user.email.split('@')[0],
      email: raw.user.email,
      role: raw.user.role as LoginResponse['user']['role'],
    },
    otpRequired: false,
    pendingToken: null,
    devOtp: null,
  };
}

/**
 * Logout function — clears stored token client-side.
 */
export function logout(): void {
  clearToken();
}
