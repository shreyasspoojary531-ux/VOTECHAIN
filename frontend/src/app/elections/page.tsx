'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getElections } from '@/services/election.api';
import { ApiError } from '@/services/api';
import type { Election } from '@/types';

export default function ElectionsListPage() {
  const [elections, setElections] = useState<Election[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchElections = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getElections();
      setElections(data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        // Mock fallback demo data if backend is offline
        const now = Date.now();
        setElections([
          {
            id: 'elec_2026_general',
            title: '2026 National Parliamentary Election',
            description:
              'General election for parliamentary representative selection across all federal constituency zones.',
            status: 'ACTIVE',
            startsAt: now - 86400000,
            endsAt: now + 86400000 * 5,
            candidates: [
              { id: 'cand_1', name: 'Dr. Aris Thorne', partyName: 'Progressive Liberty Party' },
              { id: 'cand_2', name: 'Elena Vance', partyName: 'Alliance for Innovation' },
            ],
          },
          {
            id: 'elec_2026_municipal',
            title: 'Civic Municipal Advisory Referendum',
            description:
              'Public referendum on municipal infrastructure allocation and green space development.',
            status: 'DRAFT',
            startsAt: now + 86400000 * 3,
            endsAt: now + 86400000 * 10,
            candidates: [
              { id: 'cand_3', name: 'Proposal Alpha', partyName: 'Option A' },
              { id: 'cand_4', name: 'Proposal Beta', partyName: 'Option B' },
            ],
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 font-mono text-xs font-medium text-success">
            ● Active Now
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-0.5 font-mono text-xs font-medium text-warning">
            Upcoming
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center rounded-full bg-hairline-emphasis px-2.5 py-0.5 font-mono text-xs font-medium text-ink-muted">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-0.5 font-mono text-xs font-medium text-ink-secondary">
            {status}
          </span>
        );
    }
  };

  return (
    <main className="min-h-screen bg-canvas p-6 text-ink md:p-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
            Citizen Voting Portal
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Elections</h1>
          <p className="text-sm text-ink-secondary">
            Browse active and upcoming elections to cast your verifiable cryptographic ballot.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger/10 p-4 text-xs text-danger"
          >
            <span>{error}</span>
            <button
              onClick={fetchElections}
              className="rounded bg-danger/20 px-3 py-1 font-medium text-danger hover:bg-danger/30"
            >
              Retry
            </button>
          </div>
        )}

        {/* Elections Cards List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-lg border border-hairline bg-surface"
              ></div>
            ))}
          </div>
        ) : elections && elections.length > 0 ? (
          <div className="grid gap-4">
            {elections.map((election) => (
              <div
                key={election.id}
                className="flex flex-col justify-between rounded-lg border border-hairline bg-surface p-6 transition-all hover:border-hairline-strong md:flex-row md:items-center"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-ink">{election.title}</h2>
                    {getStatusBadge(election.status)}
                  </div>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    {election.description}
                  </p>
                  <div className="flex items-center gap-4 font-mono text-xs text-ink-muted pt-1">
                    <span>Starts: {new Date(election.startsAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Ends: {new Date(election.endsAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex shrink-0 items-center gap-3">
                  <Link
                    href={`/elections/${election.id}`}
                    className="rounded-md border border-hairline bg-surface-raised px-4 py-2 text-xs font-medium text-ink hover:bg-hairline"
                  >
                    View Details
                  </Link>
                  {election.status === 'ACTIVE' && (
                    <Link
                      href={`/vote/${election.id}`}
                      className="rounded-md bg-ink px-4 py-2 text-xs font-medium text-canvas hover:opacity-90"
                    >
                      Cast Vote →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="rounded-lg border border-hairline bg-surface p-12 text-center space-y-2">
            <p className="font-mono text-sm font-semibold text-ink">No active elections</p>
            <p className="text-xs text-ink-secondary max-w-sm mx-auto">
              There are currently no active or upcoming elections available for voting. Check back
              later.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
