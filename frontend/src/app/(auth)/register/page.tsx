'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register as registerApi } from '@/services/auth.api';
import { sendOtp } from '@/services/otp.api';
import { ApiError } from '@/services/api';
import type { RegisterRequest, Role } from '@/types';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    aadhaarNumber: '',
    role: 'VOTER',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!formData.name.trim()) return 'Full Name is required.';
    if (!formData.email.trim()) return 'Email Address is required.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      return 'Please enter a valid email address.';
    }

    if (!formData.password) return 'Password is required.';
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }

    if (!formData.aadhaarNumber.trim()) return 'Aadhaar Number is required.';
    const aadhaarClean = formData.aadhaarNumber.replace(/\s+/g, '');
    if (!/^\d{12}$/.test(aadhaarClean)) {
      return 'Aadhaar Number must be exactly 12 digits.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation before API call
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await registerApi({
        ...formData,
        aadhaarNumber: formData.aadhaarNumber.replace(/\s+/g, ''),
      });

      // Send OTP to user email/identifier prior to routing to /otp
      try {
        await sendOtp({ identifier: formData.email });
      } catch {
        // Continue to /otp page even if mock OTP dispatch endpoint fails
      }

      /**
       * Flow Decision Note:
       * Routes to /otp upon registration because multi-factor OTP verification is required
       * before full session activation and identity confirmation on the ledger.
       */
      router.push(`/otp?identifier=${encodeURIComponent(formData.email)}`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-canvas text-ink">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an Account</h1>
          <p className="text-sm text-ink-secondary">Register to join the VoteChain platform</p>
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
            <label htmlFor="name" className="text-xs font-medium text-ink-secondary">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="w-full rounded-md border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-ink-secondary">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="voter@example.com"
              className="w-full rounded-md border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="aadhaarNumber" className="text-xs font-medium text-ink-secondary">
              12-Digit Aadhaar Number
            </label>
            <input
              id="aadhaarNumber"
              type="text"
              required
              maxLength={12}
              value={formData.aadhaarNumber}
              onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
              placeholder="123456789012"
              className="w-full rounded-md border border-hairline-strong bg-canvas px-3 py-2 font-mono text-sm text-ink placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-md border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="role" className="text-xs font-medium text-ink-secondary">
              Account Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              className="w-full rounded-md border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              disabled={loading}
            >
              <option value="VOTER">Voter</option>
              <option value="REGISTRAR">Registrar</option>
              <option value="ADMIN">Admin</option>
              <option value="AUDITOR">Auditor</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
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
                Registering...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-ink-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-ink hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
