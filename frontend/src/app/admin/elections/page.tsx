'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { closeElection, getElections, publishElection } from '@/services/election.api';
import { ApiError } from '@/services/api';
import type { Election } from '@/types';

export default function AdminElectionsPage() {
  const [elections, setElections] = useState<Election[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
        setError('Failed to load elections');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handlePublish = async (id: string, title: string) => {
    setUpdatingId(id);
    setError(null);
    setActionSuccess(null);
    try {
      await publishElection(id);
      setActionSuccess(`Published election "${title}". Voting is now OPEN for voters!`);
      fetchElections();
    } catch (err: unknown) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to publish election');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClose = async (id: string, title: string) => {
    if (!confirm(`Close voting for "${title}"? Voters will no longer be able to cast ballots.`)) return;

    setUpdatingId(id);
    setError(null);
    setActionSuccess(null);
    try {
      await closeElection(id);
      setActionSuccess(`Closed polls for "${title}".`);
      fetchElections();
    } catch (err: unknown) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to close election');
    } finally {
      setUpdatingId(null);
    }
  };

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
            <p className="text-xs text-ink-secondary">
              Create, publish draft elections to open voting, or close completed polls.
            </p>
          </div>

          <Link
            href="/admin/create-election"
            className="rounded-md bg-ink px-4 py-2 text-xs font-semibold text-canvas hover:opacity-90 self-start sm:self-auto"
          >
            + Create New Election
          </Link>
        </div>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger/10 p-4 text-xs text-danger"
          >
            <span>{error}</span>
            <button
              onClick={fetchElections}
              className="rounded bg-danger/20 px-3 py-1 text-xs font-semibold hover:bg-danger/30"
            >
              Retry
            </button>
          </div>
        )}

        {actionSuccess && (
          <div
            role="status"
            className="rounded-lg border border-success/30 bg-success/10 p-4 text-xs text-success"
          >
            {actionSuccess}
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
                    <td className="px-4 py-3 font-medium text-ink">
                      <div>{elec.title}</div>
                      <span className="font-mono text-[10px] text-ink-muted">{elec.id}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {elec.status === 'PUBLISHED' || elec.status === 'ACTIVE' ? (
                        <span className="text-success font-semibold">● PUBLISHED (LIVE)</span>
                      ) : elec.status === 'DRAFT' ? (
                        <span className="text-warning">● DRAFT (UPCOMING)</span>
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
                      {elec.status === 'DRAFT' && (
                        <button
                          disabled={updatingId === elec.id}
                          onClick={() => handlePublish(elec.id, elec.title)}
                          className="rounded border border-success/40 bg-success/10 px-3 py-1 text-xs font-semibold text-success hover:bg-success/20 disabled:opacity-50"
                        >
                          {updatingId === elec.id ? 'Publishing...' : '🚀 Publish Election'}
                        </button>
                      )}

                      {(elec.status === 'PUBLISHED' || elec.status === 'ACTIVE') && (
                        <button
                          disabled={updatingId === elec.id}
                          onClick={() => handleClose(elec.id, elec.title)}
                          className="rounded border border-hairline bg-surface px-3 py-1 text-xs font-mono text-ink-muted hover:bg-hairline disabled:opacity-50"
                        >
                          {updatingId === elec.id ? 'Closing...' : '🔒 Close Polls'}
                        </button>
                      )}

                      <Link
                        href={`/admin/results?electionId=${encodeURIComponent(elec.id)}`}
                        className="rounded border border-hairline bg-surface px-2.5 py-1 text-xs font-semibold text-ink hover:bg-hairline"
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
            <p className="text-sm font-semibold text-ink">No elections created yet</p>
            <p className="text-xs text-ink-secondary max-w-sm mx-auto leading-relaxed">
              Configure and publish an election to open candidate voting and ledger tracking.
            </p>
            <Link
              href="/admin/create-election"
              className="inline-block rounded-md bg-ink px-4 py-2 text-xs font-semibold text-canvas hover:opacity-90"
            >
              + Create First Election
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
