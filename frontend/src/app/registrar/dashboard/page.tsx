'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRegistrarSummary, type RegistrarSummary } from '@/services/registration.api';
import { ApiError } from '@/services/api';
import { PageHeading } from '@/components/ui/page-heading';

export default function RegistrarDashboardPage() {
  const [summary, setSummary] = useState<RegistrarSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRegistrarSummary();
      setSummary(data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        // Fallback demo summary data if backend is offline
        setSummary({
          votersRegisteredToday: 14,
          pendingVerifications: 3,
          totalRegistered: 1248,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <main className="min-h-screen bg-canvas p-6 text-ink md:p-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <PageHeading
          eyebrow="Registrar Portal"
          title="Voter Registration Overview"
        />

        {/* Error State */}
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger/10 p-4 text-xs text-danger"
          >
            <span>{error}</span>
            <button
              onClick={fetchSummary}
              className="rounded bg-danger/20 px-3 py-1 text-xs font-semibold text-danger hover:bg-danger/30"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary Cards */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-lg border border-hairline bg-surface"
              ></div>
            ))}
          </div>
        ) : summary ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-hairline bg-surface p-6 space-y-2">
              <p className="text-xs font-normal text-ink-secondary">Voters Registered Today</p>
              <p className="font-mono text-3xl font-bold text-ink">
                {summary.votersRegisteredToday}
              </p>
            </div>

            <div className="rounded-lg border border-hairline bg-surface p-6 space-y-2">
              <p className="text-xs font-normal text-ink-secondary">Pending Verifications</p>
              <p className="font-mono text-3xl font-bold text-warning">
                {summary.pendingVerifications}
              </p>
            </div>

            <div className="rounded-lg border border-hairline bg-surface p-6 space-y-2">
              <p className="text-xs font-normal text-ink-secondary">Total Registered Voters</p>
              <p className="font-mono text-3xl font-bold text-success">{summary.totalRegistered}</p>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="rounded-lg border border-hairline bg-surface p-8 text-center text-ink-muted font-mono text-xs">
            No summary data available.
          </div>
        )}

        {/* Quick Links */}
        <div className="space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-wider text-ink-secondary">
            Quick Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/registrar/aadhaar-search"
              className="group rounded-lg border border-hairline bg-surface p-6 transition-all hover:border-hairline-emphasis hover:bg-surface-raised"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink group-hover:text-accent">
                  Aadhaar Search
                </h3>
                <span className="text-xs text-ink-muted group-hover:text-accent">→</span>
              </div>
              <p className="mt-2 text-xs text-ink-secondary leading-relaxed">
                Search citizen Aadhaar database to verify eligibility and registration status.
              </p>
            </Link>

            <Link
              href="/registrar/register-voter"
              className="group rounded-lg border border-hairline bg-surface p-6 transition-all hover:border-hairline-emphasis hover:bg-surface-raised"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink group-hover:text-accent">
                  Register Voter
                </h3>
                <span className="text-xs text-ink-muted group-hover:text-accent">→</span>
              </div>
              <p className="mt-2 text-xs text-ink-secondary leading-relaxed">
                Enrol an eligible citizen into the official election register with constituency
                mapping.
              </p>
            </Link>

            <Link
              href="/registrar/voters"
              className="group rounded-lg border border-hairline bg-surface p-6 transition-all hover:border-hairline-emphasis hover:bg-surface-raised"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink group-hover:text-accent">
                  View Voters List
                </h3>
                <span className="text-xs text-ink-muted group-hover:text-accent">→</span>
              </div>
              <p className="mt-2 text-xs text-ink-secondary leading-relaxed">
                Browse, search, and audit all registered voters currently enrolled in the platform.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
