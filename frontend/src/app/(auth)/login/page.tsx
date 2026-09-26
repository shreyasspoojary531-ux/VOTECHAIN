'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { login as loginApi } from '@/services/auth.api';
import { ApiError } from '@/services/api';
import type { Role } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRoleDashboard = (role: Role): string => {
    switch (role) {
      case 'REGISTRAR':
        return '/registrar/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      case 'VOTER':
        return '/elections';
      case 'AUDITOR':
        return '/audit/dashboard';
      default:
        return '/elections';
    }
  };

  const handleQuickLogin = async (role: Role) => {
    setError(null);
    setLoading(true);

    let targetEmail = 'voter@votechain.gov';
    switch (role) {
      case 'REGISTRAR':
        targetEmail = 'registrar@votechain.gov';
        break;
      case 'ADMIN':
        targetEmail = 'admin@votechain.gov';
        break;
      case 'AUDITOR':
        targetEmail = 'auditor@votechain.gov';
        break;
      case 'VOTER':
      default:
        targetEmail = 'voter@votechain.gov';
        break;
    }

    setEmail(targetEmail);
    setPassword('password123');

    try {
      const response = await loginApi({ email: targetEmail, password: 'password123' });
      authLogin(response.jwt, response.user);
      const dashboard = getRoleDashboard(response.user.role);
      router.push(dashboard);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await loginApi({ email, password });
      authLogin(response.jwt, response.user);
      const dashboard = getRoleDashboard(response.user.role);
      router.push(dashboard);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-canvas text-ink selection:bg-accent/30 overflow-hidden">
      {/* Top Left Home Back Link */}
      <Link
        href="/"
        className="fixed top-6 left-6 text-xs text-ink-secondary hover:text-ink transition-colors flex items-center gap-1.5 z-20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm px-1.5 py-1"
      >
        <span aria-hidden="true">&lt;</span> Home
      </Link>

      {/* Ambient Full-Bleed Background Texture */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <Image
          src="/bg-login.png"
          alt="Ambient Login Background"
          fill
          priority
          className="object-cover opacity-40 mix-blend-screen"
        />
        {/* Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-canvas/80 via-canvas/60 to-canvas" />
      </div>

      {/* Centered Login Card Container */}
      <div className="w-full max-w-sm z-10 space-y-6 text-center">
        {/* Brand Logo & Header */}
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-surface-raised border border-hairline flex items-center justify-center mx-auto text-ink font-bold text-base shadow-sm">
            V
          </div>
          <h1 className="text-2xl font-normal text-ink tracking-tight font-heading">
            Log in to VoteChain
          </h1>
          <p className="text-xs text-ink-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-ink font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo Quick Login Role Selector */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider">
            Quick Demo Sign-In
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('VOTER')}
              className="p-2.5 rounded-xl border border-hairline bg-surface/80 hover:bg-surface-raised hover:border-accent text-accent text-center transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              Voter
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('REGISTRAR')}
              className="p-2.5 rounded-xl border border-hairline bg-surface/80 hover:bg-surface-raised hover:border-success text-success text-center transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-success"
            >
              Registrar
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('ADMIN')}
              className="p-2.5 rounded-xl border border-hairline bg-surface/80 hover:bg-surface-raised hover:border-warning text-warning text-center transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-warning"
            >
              Admin
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('AUDITOR')}
              className="p-2.5 rounded-xl border border-hairline bg-surface/80 hover:bg-surface-raised hover:border-danger text-danger text-center transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-danger"
            >
              Auditor
            </button>
          </div>
        </div>

        {/* Or Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-x-0 h-[1px] bg-hairline" />
          <span className="relative px-3 bg-canvas text-[11px] text-ink-muted font-mono uppercase">
            or credentials
          </span>
        </div>

        {/* Main Login Form */}
        <form
          onSubmit={handleSubmit}
          className="resend-card p-6 border border-hairline/80 space-y-4 text-left shadow-2xl"
        >
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-xs text-danger flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-danger shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-ink-secondary text-left block">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alan.turing@example.com"
              className={`w-full rounded-xl bg-[#0c0c0c] border px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none transition-all disabled:opacity-50 ${
                error
                  ? 'border-danger/60 focus:border-danger focus:ring-1 focus:ring-danger'
                  : 'border-hairline-strong focus:border-ink focus:ring-1 focus:ring-ink'
              }`}
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-medium text-ink-secondary text-left block">
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-xl bg-[#0c0c0c] border px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none transition-all disabled:opacity-50 ${
                error
                  ? 'border-danger/60 focus:border-danger focus:ring-1 focus:ring-danger'
                  : 'border-hairline-strong focus:border-ink focus:ring-1 focus:ring-ink'
              }`}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-canvas font-medium text-xs rounded-xl py-3 hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4 text-canvas" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Logging in...</span>
              </>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        {/* Quiet Footer Terms Note */}
        <p className="text-[11px] text-ink-muted text-center leading-relaxed">
          By signing in, you agree to our{' '}
          <Link href="/elections" className="text-ink-secondary hover:text-ink underline transition-colors">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/verification" className="text-ink-secondary hover:text-ink underline transition-colors">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
