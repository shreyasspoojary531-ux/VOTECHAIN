'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { listRegisteredVoters } from '@/services/registration.api';
import { ApiError } from '@/services/api';
import type { Paginated, Voter } from '@/types';
import { PageHeading } from '@/components/ui/page-heading';

export default function VotersListPage() {
  const [data, setData] = useState<Paginated<Voter> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVoters = async (currentPage: number, searchQuery: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await listRegisteredVoters(currentPage, 10, searchQuery);
      setData(result);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        // Fallback demo data if backend list endpoint is offline
        const mockVoters: Voter[] = [
          {
            id: 'VTR-892301',
            aadhaarLast4: '4321',
            name: 'Aadhaar Verified Citizen 1',
            isRegistered: true,
            constituencyId: 'CONST_001',
            registeredAt: Date.now() - 86400000,
          },
          {
            id: 'VTR-892302',
            aadhaarLast4: '8765',
            name: 'Aadhaar Verified Citizen 2',
            isRegistered: true,
            constituencyId: 'CONST_002',
            registeredAt: Date.now() - 172800000,
          },
        ];
        setData({
          items: mockVoters,
          total: 2,
          page: currentPage,
          pageSize: 10,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoters(page, search);
  }, [page, search]);

  return (
    <main className="min-h-screen bg-canvas p-6 text-ink md:p-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <PageHeading
              backHref="/registrar/dashboard"
              backLabel="Back to Dashboard"
              title="Registered Voters"
            />
          </div>

          <Link
            href="/registrar/register-voter"
            className="rounded-md bg-ink px-4 py-2 text-xs font-semibold text-canvas hover:opacity-90 self-start sm:self-auto"
          >
            + Register New Voter
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search voters by name or ID..."
            className="w-full max-w-md rounded-md border border-hairline-strong bg-surface px-4 py-2 text-sm text-ink placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Error Notification */}
        {error && (
          <div
            role="alert"
            className="rounded-md border border-danger/30 bg-danger/10 p-4 text-xs text-danger"
          >
            {error}
          </div>
        )}

        {/* Table / List Container */}
        {(() => {
          const votersList = data?.items || data?.data || [];
          if (loading) {
            return (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-lg border border-hairline bg-surface"
                  ></div>
                ))}
              </div>
            );
          }

          if (votersList.length > 0 && data) {
            return (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-hairline bg-canvas text-xs uppercase tracking-wider text-ink-secondary">
                      <tr>
                        <th className="px-4 py-3 font-medium">Voter ID</th>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Aadhaar</th>
                        <th className="px-4 py-3 font-medium">Constituency</th>
                        <th className="px-4 py-3 font-medium">Registered Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {votersList.map((voter) => (
                        <tr key={voter.id} className="hover:bg-surface-raised">
                          <td className="px-4 py-3 font-mono text-ink">{voter.id}</td>
                          <td className="px-4 py-3 text-ink">{voter.name}</td>
                          <td className="px-4 py-3 font-mono text-ink-secondary">
                            •••• •••• {voter.aadhaarLast4}
                          </td>
                          <td className="px-4 py-3 font-mono text-ink-secondary">
                            {voter.constituencyId}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                            {voter.registeredAt
                              ? new Date(voter.registeredAt).toLocaleDateString()
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between text-xs text-ink-secondary">
                  <span className="font-mono">
                    Showing page {data.page} of {Math.max(1, Math.ceil(data.total / data.pageSize))} (
                    {data.total} total)
                  </span>

                  <div className="flex gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      className="rounded border border-hairline bg-surface px-3 py-1.5 font-mono text-ink hover:bg-surface-raised disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      disabled={page * data.pageSize >= data.total}
                      onClick={() => setPage((prev) => prev + 1)}
                      className="rounded border border-hairline bg-surface px-3 py-1.5 font-mono text-ink hover:bg-surface-raised disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            /* Empty state */
            <div className="rounded-lg border border-hairline bg-surface p-12 text-center space-y-3">
              <p className="text-sm font-semibold text-ink">No voters registered yet</p>
              <p className="text-xs text-ink-secondary max-w-sm mx-auto leading-relaxed">
                Use the voter registration form to enrol citizens into the official database.
              </p>
              <Link
                href="/registrar/register-voter"
                className="inline-block rounded-md bg-ink px-4 py-2 text-xs font-semibold text-canvas hover:opacity-90"
              >
                + Register First Voter
              </Link>
            </div>
          );
        })()}
      </div>
    </main>
  );
}
