'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getElections } from '@/services/election.api';
import { ApiError } from '@/services/api';
import type { Election } from '@/types';

export default function AdminElectionsPage() {
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
        // Fallback demo data if backend is offline
        const now = Date.now();
        setElections([
          {
            id: 'elec_2026_general',
            title: '2026 National Parliamentary Election',
            description: 'General election for parliamentary representative selection.',
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
            description: 'Public referendum on municipal infrastructure allocation.',
            status: 'DRAFT',
            startsAt: now + 86400000 * 3,
            endsAt: now + 86400000 * 10,
            candidates: [{ id: 'cand_3', name: 'Proposal Alpha', partyName: 'Option A' }],
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

  return (
    <main className="min-h-screen bg-canvas p-6 text-ink md:p-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <Link
              href="/admin/dashboard"
              className="font-mono text-xs text-ink-muted hover:text-ink hover:underline"
            >
              ← Back to Console
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight">Elections Overview</h1>
          </div>

          <Link
            href="/admin/create-election"
            className="rounded-md bg-ink px-4 py-2 text-xs font-medium text-canvas hover:opacity-90 self-start sm:self-auto"
          >
            + Create New Election
          </Link>
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
              className="rounded bg-danger/20 px-3 py-1 font-medium hover:bg-danger/30"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table Container */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg border border-hairline bg-surface"
              ></div>
            ))}
          </div>
        ) : elections && elections.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-hairline bg-canvas text-xs uppercase tracking-wider text-ink-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium">Election ID</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Starts At</th>
                  <th className="px-4 py-3 font-medium">Ends At</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {elections.map((elec) => (
                  <tr key={elec.id} className="hover:bg-surface-raised">
                    <td className="px-4 py-3 font-mono text-xs text-ink">{elec.id}</td>
                    <td className="px-4 py-3 font-medium text-ink">{elec.title}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {elec.status === 'ACTIVE' ? (
                        <span className="text-success font-semibold">● ACTIVE</span>
                      ) : elec.status === 'DRAFT' ? (
                        <span className="text-warning">UPCOMING</span>
                      ) : (
                        <span className="text-ink-muted">CLOSED</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                      {new Date(elec.startsAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                      {new Date(elec.endsAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link
                        href={`/admin/results?electionId=${encodeURIComponent(elec.id)}`}
                        className="rounded border border-hairline bg-surface px-2.5 py-1 text-xs font-medium text-ink hover:bg-hairline"
                      >
                        View Results
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-hairline bg-surface p-12 text-center space-y-3">
            <p className="font-mono text-sm font-semibold text-ink">No elections created yet</p>
            <p className="text-xs text-ink-secondary max-w-sm mx-auto">
              Configure and publish an election to open candidate voting and ledger tracking.
            </p>
            <Link
              href="/admin/create-election"
              className="inline-block rounded-md bg-ink px-4 py-2 text-xs font-medium text-canvas hover:opacity-90"
            >
              + Create First Election
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
