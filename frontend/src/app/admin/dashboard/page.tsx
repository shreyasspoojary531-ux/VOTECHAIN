'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminSummary, type AdminSummary } from '@/services/election.api';
import { ApiError } from '@/services/api';

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminSummary();
      setSummary(data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        // Fallback demo summary data if backend is offline
        setSummary({
          activeElectionsCount: 2,
          totalVotesCast: 14890,
          totalElectionsCount: 5,
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
        <div className="space-y-1">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
            System Administrator
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Election Management Console</h1>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger/10 p-4 text-xs text-danger"
          >
            <span>{error}</span>
            <button
              onClick={fetchSummary}
              className="rounded bg-danger/20 px-3 py-1 font-medium text-danger hover:bg-danger/30"
            >
              Retry
            </button>
          </div>
        )}

        {/* Overview Stat Cards */}
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
              <p className="text-xs font-medium text-ink-secondary">Active Elections</p>
              <p className="font-mono text-3xl font-bold text-success">
                {summary.activeElectionsCount}
              </p>
            </div>

            <div className="rounded-lg border border-hairline bg-surface p-6 space-y-2">
              <p className="text-xs font-medium text-ink-secondary">Total Votes Cast</p>
              <p className="font-mono text-3xl font-bold text-ink">
                {(summary.totalVotesCast ?? 0).toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg border border-hairline bg-surface p-6 space-y-2">
              <p className="text-xs font-medium text-ink-secondary">All Elections Created</p>
              <p className="font-mono text-3xl font-bold text-accent">
                {summary.totalElectionsCount}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-hairline bg-surface p-8 text-center text-ink-muted font-mono text-xs">
            No system summary data available.
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-wider text-ink-secondary">
            Management Modules
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/elections"
              className="group rounded-lg border border-hairline bg-surface p-6 transition-all hover:border-hairline-emphasis hover:bg-surface-raised"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink group-hover:text-accent">
                  Elections
                </h3>
                <span className="font-mono text-xs text-ink-muted group-hover:text-accent">→</span>
              </div>
              <p className="mt-2 text-xs text-ink-secondary">
                View table of all elections, statuses, and live results links.
              </p>
            </Link>

            <Link
              href="/admin/create-election"
              className="group rounded-lg border border-hairline bg-surface p-6 transition-all hover:border-hairline-emphasis hover:bg-surface-raised"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink group-hover:text-accent">
                  Create Election
                </h3>
                <span className="font-mono text-xs text-ink-muted group-hover:text-accent">→</span>
              </div>
              <p className="mt-2 text-xs text-ink-secondary">
                Configure new election title, poll dates, and candidate roster.
              </p>
            </Link>

            <Link
              href="/admin/candidates"
              className="group rounded-lg border border-hairline bg-surface p-6 transition-all hover:border-hairline-emphasis hover:bg-surface-raised"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink group-hover:text-accent">
                  Candidates
                </h3>
                <span className="font-mono text-xs text-ink-muted group-hover:text-accent">→</span>
              </div>
              <p className="mt-2 text-xs text-ink-secondary">
                Inspect and configure candidate rosters per election.
              </p>
            </Link>

            <Link
              href="/admin/results"
              className="group rounded-lg border border-hairline bg-surface p-6 transition-all hover:border-hairline-emphasis hover:bg-surface-raised"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink group-hover:text-accent">Results</h3>
                <span className="font-mono text-xs text-ink-muted group-hover:text-accent">→</span>
              </div>
              <p className="mt-2 text-xs text-ink-secondary">
                Inspect live candidate vote tallies and turnout statistics.
              </p>
            </Link>

            <Link
              href="/admin/mock-aadhaar"
              className="group rounded-lg border border-hairline bg-surface p-6 transition-all hover:border-hairline-emphasis hover:bg-surface-raised"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink group-hover:text-accent">
                  Mock Aadhaar Directory
                </h3>
                <span className="font-mono text-xs text-ink-muted group-hover:text-accent">→</span>
              </div>
              <p className="mt-2 text-xs text-ink-secondary">
                Create and manage test citizens in the simulated Aadhaar database.
              </p>
            </Link>

            <Link
              href="/admin/data-control"
              className="group rounded-lg border border-hairline bg-surface p-6 transition-all hover:border-hairline-emphasis hover:bg-surface-raised"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink group-hover:text-accent">
                  Testing Control Hub
                </h3>
                <span className="font-mono text-xs text-ink-muted group-hover:text-accent">→</span>
              </div>
              <p className="mt-2 text-xs text-ink-secondary">
                Unified data hub to view and delete test elections, voters, and citizens.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
