import { clearToken, getToken, setToken } from '@/lib/auth-token';

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
  _isRetry?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';

/**
 * Centralized API client wrapper around standard fetch.
 * Implements silent token refresh on 401 response: if a request fails due to an
 * expired token, it automatically requests a fresh token from POST /auth/refresh
 * and retries the original request seamlessly without kicking the user out.
 */
export async function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const { method = 'GET', body, headers: customHeaders, _isRetry = false, ...restOptions } = options;

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

  // Handle HTTP errors
  if (!response.ok) {
    // 401 Unauthorized: Attempt Silent Token Refresh & Retry (if not already a retry or refresh call)
    if (response.status === 401 && !_isRetry && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
      const currentToken = getToken();
      if (currentToken) {
        try {
          const refreshUrl = `${BASE_URL.replace(/\/$/, '')}/auth/refresh`;
          const refreshRes = await fetch(refreshUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentToken}`,
            },
            body: JSON.stringify({ token: currentToken }),
          });

          if (refreshRes.ok) {
            const refreshData = (await refreshRes.json()) as {
              success: boolean;
              data: { jwt: string; user?: unknown };
            };

            if (refreshData.success && refreshData.data?.jwt) {
              const newJwt = refreshData.data.jwt;
              setToken(newJwt);
              if (refreshData.data.user && typeof window !== 'undefined') {
                localStorage.setItem('auth_user', JSON.stringify(refreshData.data.user));
              }

              // Retry original API call with the new token
              return apiClient<T>(path, {
                ...options,
                _isRetry: true,
              });
            }
          }
        } catch {
          // Silent refresh failed
        }
      }

      // If refresh fails or no token exists, clear token & redirect to login
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
