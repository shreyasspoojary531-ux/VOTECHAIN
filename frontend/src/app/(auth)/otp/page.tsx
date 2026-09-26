'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { sendOtp, verifyOtp } from '@/services/otp.api';
import { ApiError } from '@/services/api';
import type { Role } from '@/types';

function OtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: authLogin } = useAuth();

  const identifier = searchParams.get('identifier') || 'user@example.com';

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    const nextFocus = Math.min(pasted.length, 5);
    inputRefs.current[nextFocus]?.focus();
  };

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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length < 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await verifyOtp({ identifier, otp: otpCode });

      const dummyUser = {
        id: 'usr_verified',
        name: 'Verified User',
        role: 'VOTER' as Role,
        email: identifier,
      };

      const tokenToStore = response.sessionToken || 'mock_jwt_token_verified';
      authLogin(tokenToStore, dummyUser);

      const dashboard = getRoleDashboard(dummyUser.role);
      router.push(dashboard);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Verification failed. Invalid or expired OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError(null);
    setCooldown(60);
    try {
      await sendOtp({ identifier });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Verify Security Code</h1>
        <p className="text-sm text-ink-secondary">
          Enter the 6-digit OTP sent to <span className="font-mono text-ink">{identifier}</span>
        </p>
      </div>

      <form
        onSubmit={handleVerify}
        className="space-y-6 rounded-lg border border-hairline bg-surface p-6"
      >
        {error && (
          <div
            role="alert"
            className="rounded-md border border-danger/30 bg-danger/10 p-3 text-center text-xs text-danger"
          >
            {error}
          </div>
        )}

        <div className="flex justify-between gap-2">
          {otpDigits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              disabled={loading}
              aria-label={`Digit ${idx + 1}`}
              className="h-12 w-11 rounded-md border border-hairline-strong bg-canvas text-center font-mono text-lg text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otpDigits.join('').length < 6}
          className="flex w-full items-center justify-center rounded-md bg-ink py-2 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin text-canvas"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Verifying...
            </span>
          ) : (
            'Verify & Continue'
          )}
        </button>
      </form>

      <div className="text-center text-xs text-ink-muted">
        Didn&apos;t receive code?{' '}
        {cooldown > 0 ? (
          <span className="font-mono text-ink-secondary">Resend in {cooldown}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="font-medium text-ink hover:underline focus:outline-none"
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
}

export default function OtpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-canvas text-ink">
      <Suspense
        fallback={
          <div className="text-center font-mono text-xs text-ink-muted">Loading OTP screen...</div>
        }
      >
        <OtpContent />
      </Suspense>
    </main>
  );
}
