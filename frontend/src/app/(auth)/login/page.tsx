'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { login as loginApi, sendOtp, verifyOtp } from '@/services/auth.api';
import { ApiError } from '@/services/api';
import type { Role } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP flow state
  const [otpStep, setOtpStep] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

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

      if (response.otpRequired && response.pendingToken) {
        // Voter login — need OTP step
        setPendingToken(response.pendingToken);
        setOtpStep(true);

        // Auto-send OTP
        const otpResult = await sendOtp(response.pendingToken);
        if (otpResult.devOtp) {
          setDevOtpHint(otpResult.devOtp);
        }
        setLoading(false);
        return;
      }

      if (response.jwt) {
        authLogin(response.jwt, response.user);
        const dashboard = getRoleDashboard(response.user.role);
        router.push(dashboard);
      }
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

      if (response.otpRequired && response.pendingToken) {
        // Voter login — need OTP step
        setPendingToken(response.pendingToken);
        setOtpStep(true);

        // Auto-send OTP
        const otpResult = await sendOtp(response.pendingToken);
        if (otpResult.devOtp) {
          setDevOtpHint(otpResult.devOtp);
        }
        setLoading(false);
        return;
      }

      if (response.jwt) {
        authLogin(response.jwt, response.user);
        const dashboard = getRoleDashboard(response.user.role);
        router.push(dashboard);
      }
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

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingToken) return;
    setError(null);
    setLoading(true);

    try {
      const result = await verifyOtp(pendingToken, otpCode);

      if (result.jwt) {
        authLogin(result.jwt, result.user);
        const dashboard = getRoleDashboard(result.user.role);
        router.push(dashboard);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('OTP verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // OTP verification step
  if (otpStep) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-canvas text-ink">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Verify OTP</h1>
            <p className="text-sm text-ink-secondary">
              A one-time password has been sent to your registered device.
            </p>
          </div>

          <form
            onSubmit={handleOtpSubmit}
            className="space-y-4 rounded-lg border border-hairline bg-surface p-6"
          >
            {error && (
              <div
                role="alert"
                className="rounded-md border border-danger/30 bg-danger/10 p-3 text-xs text-danger"
              >
                {error}
              </div>
            )}

            {devOtpHint && (
              <div className="rounded-md border border-accent/30 bg-accent/10 p-3 text-xs text-accent font-mono text-center">
                Dev OTP: <span className="font-bold text-base">{devOtpHint}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="otp" className="text-xs font-medium text-ink-secondary">
                One-Time Password
              </label>
              <input
                id="otp"
                type="text"
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full rounded-md border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink text-center font-mono text-lg tracking-[0.3em] placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                disabled={loading}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="flex w-full items-center justify-center rounded-md bg-ink py-2 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpStep(false);
                setPendingToken(null);
                setOtpCode('');
                setDevOtpHint(null);
                setError(null);
              }}
              className="flex w-full items-center justify-center text-xs text-ink-muted hover:text-ink transition-colors"
            >
              ← Back to login
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-canvas text-ink">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in to VoteChain</h1>
          <p className="text-sm text-ink-secondary">
            Click a demo role account or enter credentials below
          </p>
        </div>

        {/* Instant Demo Role Selector */}
        <div className="p-3 rounded-lg border border-hairline bg-surface space-y-2">
          <div className="text-[11px] font-mono text-ink-muted uppercase tracking-wider text-center">
            One-Click Demo Login
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('VOTER')}
              className="p-2 rounded border border-hairline bg-canvas hover:border-accent hover:bg-surface-raised text-accent text-center transition-all disabled:opacity-50"
            >
              ⚡ Voter Login
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('REGISTRAR')}
              className="p-2 rounded border border-hairline bg-canvas hover:border-success hover:bg-surface-raised text-success text-center transition-all disabled:opacity-50"
            >
              ⚡ Registrar Login
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('ADMIN')}
              className="p-2 rounded border border-hairline bg-canvas hover:border-warning hover:bg-surface-raised text-warning text-center transition-all disabled:opacity-50"
            >
              ⚡ Admin Login
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('AUDITOR')}
              className="p-2 rounded border border-hairline bg-canvas hover:border-danger hover:bg-surface-raised text-danger text-center transition-all disabled:opacity-50"
            >
              ⚡ Auditor Login
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-hairline bg-surface p-6"
        >
          {error && (
            <div
              role="alert"
              className="rounded-md border border-danger/30 bg-danger/10 p-3 text-xs text-danger"
            >
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-ink-secondary">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voter@votechain.gov"
              className="w-full rounded-md border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium text-ink-secondary">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-ink py-2 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-ink-muted">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-ink hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
