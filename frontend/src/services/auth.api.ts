import { apiClient } from './api';
import { clearToken } from '@/lib/auth-token';
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types';

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
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  return apiClient<LoginResponse>('/auth/login', {
    method: 'POST',
    body: data,
  });
}

/**
 * Logout function — clears stored token client-side.
 */
export function logout(): void {
  clearToken();
}
