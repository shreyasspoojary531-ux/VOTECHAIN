'use client';

import React from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import type { Role } from '@/types';
import Link from 'next/link';

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

/**
 * Client-side segment role guard.
 * Note: No route's protection should be assumed sufficient on its own —
 * this is UX redirect only, real enforcement is server-side.
 */
export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, isAuthenticated, loading } = useRequireAuth(allowedRoles);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="animate-pulse flex space-x-2">
          <div className="h-2 w-2 bg-ink-muted rounded-full"></div>
          <div className="h-2 w-2 bg-ink-muted rounded-full"></div>
          <div className="h-2 w-2 bg-ink-muted rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas px-6">
        <div className="bg-surface border border-hairline rounded-lg p-8 max-w-md w-full text-center">
          <h1 className="text-lg font-semibold text-ink mb-2">Access Denied</h1>
          <p className="text-sm text-ink-secondary mb-6">
            You do not have permission to view this section ({user.role}).
          </p>
          <Link href="/" className="text-xs font-mono text-accent hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
