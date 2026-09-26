'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types';

/**
 * UX-only client-side auth & role guard hook.
 *
 * Note: No route's protection should be assumed sufficient on its own —
 * this is UX redirect only, real enforcement is server-side.
 */
export function useRequireAuth(allowedRoles?: Role[]) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isAuthPage = ['/login', '/register', '/otp'].includes(pathname);

    if (!isAuthenticated && !isAuthPage) {
      // Unauthenticated users hitting protected routes -> redirect to /login
      router.replace('/login');
    } else if (isAuthenticated && isAuthPage) {
      // Authenticated users hitting auth pages -> redirect to role dashboard
      switch (user?.role) {
        case 'REGISTRAR':
          router.replace('/registrar/dashboard');
          break;
        case 'ADMIN':
          router.replace('/admin/dashboard');
          break;
        case 'AUDITOR':
          router.replace('/audit/dashboard');
          break;
        case 'VOTER':
        default:
          router.replace('/elections');
          break;
      }
    } else if (isAuthenticated && allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
      // User role not authorized for this specific route segment
      switch (user.role) {
        case 'REGISTRAR':
          router.replace('/registrar/dashboard');
          break;
        case 'ADMIN':
          router.replace('/admin/dashboard');
          break;
        case 'AUDITOR':
          router.replace('/audit/dashboard');
          break;
        case 'VOTER':
        default:
          router.replace('/elections');
          break;
      }
    }
  }, [user, isAuthenticated, loading, allowedRoles, router, pathname]);

  return { user, isAuthenticated, loading };
}
