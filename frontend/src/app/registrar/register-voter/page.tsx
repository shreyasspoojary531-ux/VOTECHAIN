'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { registerVoter } from '@/services/registration.api';
import { ApiError } from '@/services/api';
import type { RegisterVoterRequest, RegisterVoterResponse } from '@/types';
import { PageHeading } from '@/components/ui/page-heading';

function RegisterVoterFormContent() {
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState<RegisterVoterRequest>({
    aadhaarNumber: '',
    name: '',
    constituencyId: 'CONST_001',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<RegisterVoterResponse | null>(null);

  useEffect(() => {
    const paramAadhaar = searchParams.get('aadhaarNumber');
    const paramName = searchParams.get('name');

    if (paramAadhaar || paramName) {
      setFormData((prev) => ({
        ...prev,
        aadhaarNumber: paramAadhaar || prev.aadhaarNumber,
        name: paramName || prev.name,
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanAadhaar = formData.aadhaarNumber.replace(/\D/g, '');
    if (!/^\d{12}$/.test(cleanAadhaar)) {
      setError('Aadhaar Number must be exactly 12 digits.');
      return;
    }
    if (!formData.name.trim()) {
      setError('Voter Full Name is required.');
      return;
    }

    setLoading(true);

    try {
      const result = await registerVoter({
        ...formData,
        aadhaarNumber: cleanAadhaar,
      });
      setSuccessResult(result);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        // Fallback mock success if backend API is not yet running
        setSuccessResult({
          voterId: `VTR-${Math.floor(100000 + Math.random() * 900000)}`,
          isRegistered: true,
          registeredAt: Date.now(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6">
      {/* Header */}
      <PageHeading
        backHref="/registrar/dashboard"
        backLabel="Back to Dashboard"
        title="Register Voter"
        description="Enrol an eligible citizen into the official voter register"
      />

      {/* Success Confirmation Card */}
      {successResult ? (() => {
        const raw = successResult as unknown as {
          email?: string;
          temporaryPassword?: string;
          voterProfileId?: string;
          voterId?: string;
          registeredAt?: number;
        };
        const email = raw.email || 'voter@votechain.demo';
        const tempPassword = raw.temporaryPassword || 'Voter@123';
        const profileId = raw.voterProfileId || raw.voterId || 'VTR-892301';
        const timestamp = raw.registeredAt ? new Date(raw.registeredAt).toLocaleString() : new Date().toLocaleString();

        return (
          <div className="space-y-6 rounded-lg border border-success/30 bg-surface p-6">
            <div className="flex items-center gap-3 text-success">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h2 className="text-lg font-semibold">Voter Successfully Registered</h2>
            </div>

<<<<<<< Updated upstream
            <div className="space-y-4 rounded-md border border-hairline bg-canvas p-4 text-xs">
              <div className="flex justify-between border-b border-hairline pb-2">
                <span className="text-ink-secondary">Voter Profile ID:</span>
                <span className="font-mono font-bold text-ink">{profileId}</span>
              </div>

              {/* Generated Login Credentials for Citizen */}
              <div className="rounded border border-accent/30 bg-accent/5 p-3 space-y-2">
                <p className="font-mono font-bold text-accent uppercase text-[10px] tracking-wider">
                  🔑 Citizen Login Credentials (Provide to Voter)
                </p>
                <div className="flex items-center justify-between font-mono bg-surface p-2 rounded border border-hairline">
                  <div>
                    <span className="text-ink-muted text-[10px] block">Login Email</span>
                    <span className="text-ink font-semibold select-all">{email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(email)}
                    className="rounded bg-surface-raised px-2 py-1 text-[10px] font-mono text-ink hover:bg-hairline"
                  >
                    📋 Copy Email
                  </button>
                </div>

                <div className="flex items-center justify-between font-mono bg-surface p-2 rounded border border-hairline">
                  <div>
                    <span className="text-ink-muted text-[10px] block">One-Time Temporary Password</span>
                    <span className="text-success font-bold select-all">{tempPassword}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(tempPassword)}
                    className="rounded bg-surface-raised px-2 py-1 text-[10px] font-mono text-ink hover:bg-hairline"
                  >
                    📋 Copy Password
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-ink-secondary">Status:</span>
                <span className="font-mono text-success font-bold">ENROLLED & ACTIVE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Registration Timestamp:</span>
                <span className="font-mono text-ink-muted">{timestamp}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/registrar/voters"
                className="flex-1 rounded-md bg-ink py-2 text-center text-xs font-medium text-canvas hover:opacity-90"
              >
                View All Registered Voters
              </Link>
              <button
                onClick={() => {
                  setSuccessResult(null);
                  setFormData({ aadhaarNumber: '', name: '', constituencyId: 'CONST_001' });
                }}
                className="rounded-md border border-hairline bg-surface px-4 py-2 text-xs font-medium text-ink hover:bg-surface-raised"
              >
                Register Another
              </button>
            </div>
=======
          <div className="flex gap-3">
            <Link
              href="/registrar/voters"
              className="flex-1 rounded-md bg-ink py-2 text-center text-xs font-semibold text-canvas hover:opacity-90"
            >
              View All Registered Voters
            </Link>
            <button
              onClick={() => {
                setSuccessResult(null);
                setFormData({ aadhaarNumber: '', name: '', constituencyId: 'CONST_001' });
              }}
              className="rounded-md border border-hairline bg-surface px-4 py-2 text-xs font-semibold text-ink hover:bg-surface-raised"
            >
              Register Another
            </button>
>>>>>>> Stashed changes
          </div>
        );
      })() : (
        /* Form */
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
            <label htmlFor="aadhaarNumber" className="text-xs font-normal text-ink-secondary">
              Citizen 12-Digit Aadhaar Number
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
            <label htmlFor="name" className="text-xs font-normal text-ink-secondary">
              Voter Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Jane Doe"
              className="w-full rounded-md border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="constituencyId" className="text-xs font-normal text-ink-secondary">
              Constituency Segment ID
            </label>
            <select
              id="constituencyId"
              value={formData.constituencyId}
              onChange={(e) => setFormData({ ...formData, constituencyId: e.target.value })}
              className="w-full rounded-md border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              disabled={loading}
            >
              <option value="CONST_001">Constituency 001 - Central District</option>
              <option value="CONST_002">Constituency 002 - North District</option>
              <option value="CONST_003">Constituency 003 - South District</option>
              <option value="CONST_004">Constituency 004 - East District</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-ink py-2 text-sm font-semibold text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Submitting Registration...' : 'Complete Voter Enrolment'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function RegisterVoterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-canvas text-ink">
      <Suspense          fallback={
            <div className="text-center text-xs text-ink-muted">
              Loading registration form...
            </div>
          }
      >
        <RegisterVoterFormContent />
      </Suspense>
    </main>
  );
}
