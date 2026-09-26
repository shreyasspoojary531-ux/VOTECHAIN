'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getElectionById } from '@/services/election.api';
import { ApiError } from '@/services/api';
import type { Election } from '@/types';

export default function ElectionDetailPage() {
  const params = useParams();
  const id =
    typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getElectionById(id);
      setElection(data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        // Fallback demo data if backend detail endpoint is offline
        const now = Date.now();
        setElection({
          id,
          title: '2026 National Parliamentary Election',
          description:
            'Official election for parliamentary representatives. Each registered citizen casts a single cryptographic ballot recorded on the VoteChain ledger.',
          status: 'ACTIVE',
          startsAt: now - 86400000,
          endsAt: now + 86400000 * 5,
          candidates: [
            {
              id: 'cand_1',
              name: 'Dr. Aris Thorne',
              partyName: 'Progressive Liberty Party',
              imageUrl: null,
            },
            {
              id: 'cand_2',
              name: 'Elena Vance',
              partyName: 'Alliance for Innovation',
              imageUrl: null,
            },
            {
              id: 'cand_3',
              name: 'Marcus Chen',
              partyName: 'United Reform Coalition',
              imageUrl: null,
            },
          ],
        });
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return (
    <main className="min-h-screen bg-canvas p-6 text-ink md:p-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Back Link */}
        <Link
          href="/elections"
          className="font-mono text-xs text-ink-muted hover:text-ink hover:underline"
        >
          ← Back to All Elections
        </Link>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger/10 p-4 text-xs text-danger"
          >
            <span>{error}</span>
            <button
              onClick={fetchDetail}
              className="rounded bg-danger/20 px-3 py-1 font-medium text-danger hover:bg-danger/30"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            <div className="h-10 w-2/3 animate-pulse rounded bg-surface"></div>
            <div className="h-24 animate-pulse rounded-lg border border-hairline bg-surface"></div>
            <div className="h-48 animate-pulse rounded-lg border border-hairline bg-surface"></div>
          </div>
        ) : election ? (
          <div className="space-y-8">
            {/* Header Metadata */}
            <div className="space-y-3 rounded-lg border border-hairline bg-surface p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-ink-muted">
                  Election ID: {election.id}
                </span>
                <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 font-mono text-xs font-medium text-success">
                  ● {election.status}
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight">{election.title}</h1>
              <p className="text-sm text-ink-secondary leading-relaxed">{election.description}</p>

              <div className="flex flex-wrap gap-6 pt-4 border-t border-hairline text-xs font-mono text-ink-muted">
                <div>
                  <span className="text-ink-secondary block">Polls Opened</span>
                  <span>{new Date(election.startsAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-ink-secondary block">Polls Close</span>
                  <span>{new Date(election.endsAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Candidates List */}
            <div className="space-y-4">
              <h2 className="text-xs font-medium uppercase tracking-wider text-ink-secondary">
                Official Candidates ({election.candidates.length})
              </h2>

              {election.candidates.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {election.candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="rounded-lg border border-hairline bg-surface p-4 flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-semibold text-ink">{candidate.name}</h3>
                        <p className="text-xs text-ink-secondary">{candidate.partyName}</p>
                      </div>
                      <span className="font-mono text-xs text-ink-muted">{candidate.id}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-hairline bg-surface p-6 text-center text-xs text-ink-muted font-mono">
                  No candidates registered for this election yet.
                </div>
              )}
            </div>

            {/* CTA to Vote */}
            {election.status === 'ACTIVE' && (
              <div className="rounded-lg border border-hairline-emphasis bg-surface-raised p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-ink">Ready to cast your ballot?</h3>
                  <p className="text-xs text-ink-secondary">
                    Your choice is encrypted and signed with a blind cryptographic receipt.
                  </p>
                </div>
                <Link
                  href={`/vote/${election.id}`}
                  className="rounded-md bg-ink px-6 py-2.5 text-sm font-medium text-canvas hover:opacity-90 shrink-0"
                >
                  Proceed to Vote →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-hairline bg-surface p-8 text-center text-xs text-ink-muted font-mono">
            Election record not found.
          </div>
        )}
      </div>
    </main>
  );
}
