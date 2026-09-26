/**
 * Auth Token Store Abstraction.
 *
 * Current implementation: Client-side memory & localStorage fallback.
 * Structured so swapping to httpOnly cookies or server-side session management
 * later is a one-file change in this file.
 */

let inMemoryToken: string | null = null;

export function getToken(): string | null {
  if (typeof window !== 'undefined' && !inMemoryToken) {
    inMemoryToken = localStorage.getItem('auth_token');
  }
  return inMemoryToken;
}

export function setToken(token: string): void {
  inMemoryToken = token;
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

export function clearToken(): void {
  inMemoryToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}
