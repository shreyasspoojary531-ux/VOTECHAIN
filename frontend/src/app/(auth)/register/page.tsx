'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { register as registerApi } from '@/services/auth.api';
import { sendOtp } from '@/services/otp.api';
import { ApiError } from '@/services/api';
import type { Role } from '@/types';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    aadhaarNumber: string;
    role: Role;
  }>({
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

      try {
        await sendOtp({ identifier: formData.email });
      } catch {
        // Continue to /otp page even if mock OTP dispatch endpoint fails
      }

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
          src="/bg-auth.png"
          alt="Ambient Auth Background"
          fill
          priority
          className="object-cover opacity-75"
        />
        {/* Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-canvas/70 via-canvas/40 to-canvas/80" />
      </div>

      {/* Centered Register Card Container */}
      <div className="w-full max-w-sm z-10 space-y-6 text-center my-8">
        {/* Brand Logo & Header */}
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-surface-raised border border-hairline flex items-center justify-center mx-auto text-ink font-bold text-base shadow-sm">
            V
          </div>
          <h1 className="text-2xl font-medium text-ink tracking-tight font-poppins">
            Create an Account
          </h1>
          <p className="text-xs text-ink-secondary">
            Already have an account?{' '}
            <Link href="/login" className="text-ink font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>

        {/* Main Register Form */}
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
            <label htmlFor="name" className="text-xs font-medium text-ink-secondary text-left block">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="w-full rounded-xl bg-[#0c0c0c] border border-hairline-strong px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all disabled:opacity-50"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-ink-secondary text-left block">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="voter@example.com"
              className="w-full rounded-xl bg-[#0c0c0c] border border-hairline-strong px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all disabled:opacity-50"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="aadhaarNumber" className="text-xs font-medium text-ink-secondary text-left block">
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
              className="w-full rounded-xl bg-[#0c0c0c] border border-hairline-strong px-3.5 py-2.5 font-mono text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all disabled:opacity-50"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium text-ink-secondary text-left block">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-xl bg-[#0c0c0c] border border-hairline-strong px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all disabled:opacity-50"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="role" className="text-xs font-medium text-ink-secondary text-left block">
              Account Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              className="w-full rounded-xl bg-[#0c0c0c] border border-hairline-strong px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all disabled:opacity-50"
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
            className="w-full bg-ink text-canvas font-medium text-xs rounded-xl py-3 hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4 text-canvas" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Quiet Footer Terms Note */}
        <p className="text-[11px] text-ink-muted text-center leading-relaxed">
          By signing up, you agree to our{' '}
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
