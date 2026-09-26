'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleLinks = () => {
    if (!user) return [];
    switch (user.role) {
      case 'VOTER':
        return [
          { href: '/elections', label: 'Elections' },
          { href: '/blockchain/explorer', label: 'Blockchain' },
        ];
      case 'REGISTRAR':
        return [
          { href: '/registrar/dashboard', label: 'Dashboard' },
          { href: '/registrar/aadhaar-search', label: 'Search' },
          { href: '/registrar/register-voter', label: 'Register' },
          { href: '/registrar/voters', label: 'Voters' },
        ];
      case 'ADMIN':
        return [
          { href: '/admin/dashboard', label: 'Dashboard' },
          { href: '/admin/elections', label: 'Elections' },
          { href: '/admin/create-election', label: 'Create' },
          { href: '/admin/candidates', label: 'Candidates' },
          { href: '/admin/results', label: 'Results' },
        ];
      case 'AUDITOR':
        return [
          { href: '/audit/dashboard', label: 'Audit' },
          { href: '/blockchain/explorer', label: 'Blockchain' },
        ];
      default:
        return [];
    }
  };

  const links = getRoleLinks();

  const DesktopLinks = () => (
    <div className="hidden md:flex items-center space-x-6">
      {links.map((link) => {
        const isActive = pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`text-xs font-medium tracking-wider transition-colors ${
              isActive ? 'text-accent' : 'text-ink-secondary hover:text-ink'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );

  const MobileMenu = () => {
    if (!mobileMenuOpen) return null;
    return (
      <div className="md:hidden bg-canvas border-b border-hairline px-6 py-4 space-y-4">
        {links.map((link) => {
          const isActive = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block text-xs font-medium tracking-wider transition-colors ${
                isActive ? 'text-accent' : 'text-ink-secondary hover:text-ink'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        {isAuthenticated ? (
          <div className="pt-4 border-t border-hairline flex flex-col space-y-4">
            <div className="font-mono text-xs text-ink-muted">
              {user?.name}{' '}
              <span className="bg-surface-raised px-1.5 py-0.5 rounded-md ml-2 border border-hairline">
                {user?.role}
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="text-left text-xs text-ink-muted hover:text-danger transition-colors font-medium tracking-wider"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="pt-4 border-t border-hairline flex flex-col space-y-4">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-medium tracking-wider text-ink-secondary hover:text-ink"
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-medium tracking-wider text-ink-secondary hover:text-ink"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="fixed top-0 w-full bg-canvas border-b border-hairline z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
        {/* Left Side */}
        <Link href="/" className="text-sm font-semibold text-ink">
          VoteChain
        </Link>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center space-x-8">
          <DesktopLinks />

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="font-mono text-xs text-ink-muted flex items-center gap-2">
                  <span>{user?.name}</span>
                  <span className="bg-surface-raised px-1.5 py-0.5 rounded-md border border-hairline uppercase text-[10px] tracking-wider">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-xs text-ink-muted hover:text-danger transition-colors font-medium tracking-wider"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-medium tracking-wider text-ink-secondary hover:text-ink"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-medium tracking-wider text-ink-secondary hover:text-ink"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-ink p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
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

      <MobileMenu />
    </nav>
  );
}
