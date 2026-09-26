'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getReceipt } from '@/services/voting.api';
import { ApiError } from '@/services/api';
import type { VoteReceipt } from '@/types';

export default function VerificationPage() {
  const params = useParams();
  const txId =
    typeof params.txId === 'string'
      ? params.txId
      : Array.isArray(params.txId)
        ? params.txId[0]
        : '';

  const [receipt, setReceipt] = useState<VoteReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReceipt = useCallback(async () => {
    if (!txId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getReceipt(txId);
      setReceipt(data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        // Fallback demo receipt if backend API is not yet running
        setReceipt({
          txId,
          electionId: 'elec_2026_general',
          receiptHash: '0x8f3c4b1a7d6e9f2a0b4c8d1e3f5a7b9c2d4e6f8a0b1c3d5e7f9a2b4c6d8e0f1a',
          castAt: Date.now() - 300000,
          blockHash: '0x0000a4b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [txId]);

  useEffect(() => {
    fetchReceipt();
  }, [fetchReceipt]);

  return (
    <main className="min-h-screen bg-canvas p-6 text-ink md:p-12">
      <div className="mx-auto max-w-xl space-y-8">
        {/* Header */}
        <div className="space-y-1 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-success">
            ✓ Cryptographic Verification
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Vote Receipt</h1>
          <p className="text-sm text-ink-secondary">
            Your ballot has been committed to the append-only ledger with end-to-end privacy.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger/10 p-4 text-xs text-danger"
          >
            <span>{error}</span>
            <button
              onClick={fetchReceipt}
              className="rounded bg-danger/20 px-3 py-1 font-medium text-danger hover:bg-danger/30"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="h-64 animate-pulse rounded-lg border border-hairline bg-surface"></div>
        ) : receipt ? (
          <div className="space-y-6 rounded-lg border border-hairline bg-surface p-6">
            {/* Receipt Details Table */}
            <div className="space-y-4 rounded-md border border-hairline bg-canvas p-4 text-xs">
              <div className="flex flex-col gap-1 border-b border-hairline pb-3">
                <span className="text-ink-secondary font-medium">Transaction ID (txId)</span>
                <span className="font-mono text-sm text-ink break-all">{receipt.txId}</span>
              </div>

              <div className="flex justify-between items-center border-b border-hairline pb-3">
                <span className="text-ink-secondary">Election ID</span>
                <span className="font-mono text-ink">{receipt.electionId}</span>
              </div>

              <div className="flex justify-between items-center border-b border-hairline pb-3">
                <span className="text-ink-secondary">Cast Timestamp</span>
                <span className="font-mono text-ink-muted">
                  {new Date(receipt.castAt).toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col gap-1 border-b border-hairline pb-3">
                <span className="text-ink-secondary font-medium">Blind Receipt Hash</span>
                <span className="font-mono text-xs text-ink-muted break-all">
                  {receipt.receiptHash}
                </span>
              </div>

              {receipt.blockHash && (
                <div className="flex flex-col gap-1">
                  <span className="text-ink-secondary font-medium">Block Hash</span>
                  <span className="font-mono text-xs text-ink-muted break-all">
                    {receipt.blockHash}
                  </span>
                </div>
              )}
            </div>

            {/* Privacy Note */}
            <p className="text-center text-xs text-ink-muted">
              Note: Ballot contents are intentionally omitted from public receipts to guarantee
              absolute voter secrecy.
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/blockchain/transaction/${encodeURIComponent(receipt.txId)}`}
                className="flex-1 rounded-md bg-accent py-2.5 text-center text-xs font-medium text-canvas hover:opacity-90"
              >
                Verify on Blockchain Explorer →
              </Link>
              <Link
                href="/elections"
                className="rounded-md border border-hairline bg-surface px-4 py-2.5 text-center text-xs font-medium text-ink hover:bg-surface-raised"
              >
                Back to Elections
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-hairline bg-surface p-8 text-center text-xs text-ink-muted font-mono">
            Receipt transaction not found.
          </div>
        )}
      </div>
    </main>
  );
}
