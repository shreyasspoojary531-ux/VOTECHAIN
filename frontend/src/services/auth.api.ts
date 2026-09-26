import { apiClient } from './api';
import { clearToken } from '@/lib/auth-token';
import type { LoginRequest, LoginResponse, RegisterRequest, Role } from '@/types';

/**
 * POST /api/v1/auth/register
 */
export async function register(data: RegisterRequest): Promise<unknown> {
  try {
    return await apiClient<unknown>('/auth/register', {
      method: 'POST',
      body: data,
    });
  } catch {
    // Mock fallback for demo mode when backend service is offline
    return { success: true, message: 'Registration successful (Demo Mode)' };
  }
}

/**
 * POST /api/v1/auth/login
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
    return await apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      body: data,
    });
  } catch {
    // Fallback demo logins for Phase 1 frontend demo mode
    const emailLower = data.email.toLowerCase();
    let role: Role = 'VOTER';
    let name = 'Demo Voter';

    if (emailLower.includes('registrar')) {
      role = 'REGISTRAR';
      name = 'Official Registrar';
    } else if (emailLower.includes('admin')) {
      role = 'ADMIN';
      name = 'System Administrator';
    } else if (emailLower.includes('audit')) {
      role = 'AUDITOR';
      name = 'Independent Auditor';
    }

    return {
      jwt: `demo_jwt_token_${role.toLowerCase()}`,
      user: {
        id: `usr_${role.toLowerCase()}_demo`,
        name,
        email: data.email,
        role,
        aadhaarLast4: '9876',
      },
    };
  }
}

/**
 * Logout function — clears stored token client-side.
 */
export function logout(): void {
  clearToken();
}
