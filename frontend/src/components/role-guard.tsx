'use client';

import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="animate-pulse flex space-x-2">
          <div className="h-2 w-2 bg-ink-muted rounded-full"></div>
          <div className="h-2 w-2 bg-ink-muted rounded-full animation-delay-150"></div>
          <div className="h-2 w-2 bg-ink-muted rounded-full animation-delay-300"></div>
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
            You don&apos;t have permission to view this page.
          </p>
          <Link 
            href="/"
            className="text-xs font-medium tracking-wider text-accent hover:text-ink transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
