'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * UX-only gating: The backend is the authority on what each role can actually do;
 * hidden nav items are a UX convenience, not access control.
 */
export default function Nav() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Role-specific navigation links map
  const getRoleNavItems = () => {
    if (!user) {
      return [
        { href: '/elections', label: 'Elections' },
        { href: '/blockchain/explorer', label: 'Ledger' },
      ];
    }

    switch (user.role) {
      case 'REGISTRAR':
        return [
          { href: '/registrar/dashboard', label: 'Dashboard' },
          { href: '/registrar/aadhaar-search', label: 'Search Aadhaar' },
          { href: '/registrar/register-voter', label: 'Register Voter' },
          { href: '/registrar/voters', label: 'Voters List' },
        ];
      case 'VOTER':
        return [
          { href: '/elections', label: 'Elections' },
          { href: '/verification/tx_demo', label: 'Receipt Verification' },
          { href: '/blockchain/explorer', label: 'Ledger Explorer' },
        ];
      case 'ADMIN':
        return [
          { href: '/admin/dashboard', label: 'Dashboard' },
          { href: '/admin/elections', label: 'Elections' },
          { href: '/admin/create-election', label: 'Create Election' },
          { href: '/admin/candidates', label: 'Candidates' },
          { href: '/admin/results', label: 'Results' },
        ];
      case 'AUDITOR':
        return [
          { href: '/audit/dashboard', label: 'Audit Dashboard' },
          { href: '/blockchain/explorer', label: 'Ledger Explorer' },
        ];
      default:
        return [];
    }
  };

  const navItems = getRoleNavItems();

  return (
    <nav
      aria-label="Main Navigation"
      className="fixed top-0 w-full bg-canvas border-b border-hairline z-50"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
        {/* Brand */}
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-ink flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>VoteChain</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-mono transition-colors px-2 py-1 rounded ${
                  isActive
                    ? 'text-accent bg-surface-raised font-bold'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Auth Control */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="font-mono text-xs text-ink-muted flex items-center gap-2">
                <span>{user?.name}</span>
                <span className="bg-surface-raised px-1.5 py-0.5 rounded border border-hairline text-[10px] text-accent uppercase font-bold">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="text-xs font-mono text-ink-muted hover:text-danger transition-colors px-2 py-1 rounded border border-hairline hover:border-danger/40"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login" className="text-xs font-mono text-ink-secondary hover:text-ink">
                Login
              </Link>
              <Link
                href="/register"
                className="text-xs font-mono px-3 py-1.5 rounded bg-accent text-canvas font-semibold hover:opacity-90"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-ink p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-hairline px-6 py-4 space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-xs font-mono py-1.5 ${
                  isActive ? 'text-accent font-bold' : 'text-ink-secondary hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-hairline flex justify-between items-center text-xs font-mono">
            {isAuthenticated ? (
              <>
                <span className="text-ink-muted">
                  {user?.name} ({user?.role})
                </span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-danger"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-4">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-ink-secondary"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-accent font-bold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
