import { apiClient } from './api';
import type { SendOtpRequest, VerifyOtpRequest, VerifyOtpResponse } from '@/types';

/**
 * POST /api/v1/auth/send-otp
 */
export async function sendOtp(data: SendOtpRequest): Promise<unknown> {
  return apiClient<unknown>('/auth/send-otp', {
    method: 'POST',
    body: data,
  });
}

/**
 * POST /api/v1/auth/verify-otp
 */
export async function verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  return apiClient<VerifyOtpResponse>('/auth/verify-otp', {
    method: 'POST',
    body: data,
  });
}
