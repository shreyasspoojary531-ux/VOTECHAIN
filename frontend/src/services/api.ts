/**
 * Centralized API client.
 *
 * Every backend call in this app must go through this axios instance so the
 * base URL and (future) JWT header injection live in exactly one place.
 */
import axios, {
  type AxiosError,
  type AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ---------------------------------------------------------------------------
// Request interceptor — JWT header stub
// ---------------------------------------------------------------------------

/**
 * Token storage is deliberately a stub for the scaffold phase. Auth logic
 * arrives in a later prompt; until then this always returns null and no
 * Authorization header is ever attached.
 *
 * Future shape (do not implement yet):
 * - `getToken()` reads the access token from the auth store / cookie.
 * - 401 responses trigger a refresh-token flow in the response interceptor.
 */
const getToken = (): string | null => null;

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor — error normalization stub
// ---------------------------------------------------------------------------

/** Normalized error shape every service layer function will reject with. */
export interface ApiError {
  status: number | null;
  message: string;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const normalized: ApiError = {
      status: error.response?.status ?? null,
      message: error.response?.data?.message ?? error.message,
    };
    return Promise.reject(normalized);
  },
);
