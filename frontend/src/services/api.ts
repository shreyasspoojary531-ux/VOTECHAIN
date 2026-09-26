import { clearToken, getToken } from '@/lib/auth-token';

export class ApiError extends Error {
  status: number;
  override message: string;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.message = message;
    this.code = code;
  }
}

export interface ApiClientOptions extends Omit<RequestInit, 'body'> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';

/**
 * Centralized API client wrapper around standard fetch.
 * Handles base URL prefixing, JWT header injection, JSON body serialization,
 * error normalization, response parsing, and automatic token expiration cleanup.
 */
export async function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const { method = 'GET', body, headers: customHeaders, ...restOptions } = options;

  const url = path.startsWith('http')
    ? path
    : `${BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
    ...restOptions,
  };

  if (body !== undefined) {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (err: unknown) {
    const error = err as Error;
    throw new ApiError(0, error.message || 'Network error');
  }

  if (response.status === 204) {
    return {} as T;
  }

  let data: unknown;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    // 401 Unauthorized handling: clear expired token and prompt re-login
    if (response.status === 401) {
      clearToken();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_user');
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    }

    const errObj =
      typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : null;
    const message =
      (errObj && typeof errObj.message === 'string' ? errObj.message : null) ||
      (typeof data === 'string' && data ? data : null) ||
      `HTTP request failed with status ${response.status}`;
    const code = errObj && typeof errObj.code === 'string' ? errObj.code : undefined;
    throw new ApiError(response.status, message, code);
  }

  return data as T;
}

/** Export api alias for existing service stubs */
export const api = apiClient;
