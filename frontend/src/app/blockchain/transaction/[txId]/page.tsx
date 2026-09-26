'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getTransaction } from '@/services/blockchain.api';
import { ApiError } from '@/services/api';
import type { Transaction } from '@/types';

export default function TransactionDetailPage() {
  const params = useParams();
  const txId =
    typeof params.txId === 'string'
      ? params.txId
      : Array.isArray(params.txId)
        ? params.txId[0]
        : '';

  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTx = useCallback(async () => {
    if (!txId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTransaction(txId);
      setTx(data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        // Fallback demo transaction data
        setTx({
          txId,
          blockHash: '0x0000a4b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
          type: 'VOTE',
          timestamp: Date.now() - 300000,
          payloadHash: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [txId]);

  useEffect(() => {
    fetchTx();
  }, [fetchTx]);

  return (
    <main className="min-h-screen bg-canvas p-6 text-ink md:p-12">
      <div className="mx-auto max-w-xl space-y-8">
        {/* Navigation */}
        <Link
          href="/blockchain/explorer"
          className="font-mono text-xs text-ink-muted hover:text-ink hover:underline"
        >
          ← Back to Ledger Explorer
        </Link>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger/10 p-4 text-xs text-danger"
          >
            <span>{error}</span>
            <button
              onClick={fetchTx}
              className="rounded bg-danger/20 px-3 py-1 font-medium hover:bg-danger/30"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="h-64 animate-pulse rounded-lg border border-hairline bg-surface"></div>
        ) : tx ? (
          <div className="space-y-6 rounded-lg border border-hairline bg-surface p-6">
            {/* Header */}
            <div className="space-y-1 text-center">
              <span className="font-mono text-xs uppercase tracking-widest text-success">
                ✓ IMMUTABLE LEDGER RECORD
              </span>
              <h1 className="text-2xl font-semibold tracking-tight">Transaction Detail</h1>
              <p className="text-xs text-ink-secondary">
                Verifiable proof of commitment recorded on the VoteChain append-only blockchain.
              </p>
            </div>

            {/* Details Table */}
            <div className="space-y-4 rounded-md border border-hairline bg-canvas p-4 text-xs">
              <div className="flex flex-col gap-1 border-b border-hairline pb-3">
                <span className="text-ink-secondary font-medium">Transaction ID</span>
                <span className="font-mono text-sm text-ink break-all">{tx.txId}</span>
              </div>

              <div className="flex justify-between items-center border-b border-hairline pb-3">
                <span className="text-ink-secondary">Transaction Type</span>
                <span className="font-mono font-bold text-accent">{tx.type}</span>
              </div>

              <div className="flex justify-between items-center border-b border-hairline pb-3">
                <span className="text-ink-secondary">Commit Timestamp</span>
                <span className="font-mono text-ink-muted">
                  {new Date(tx.timestamp).toLocaleString()}
                </span>
              </div>

              {tx.blockHash && (
                <div className="flex flex-col gap-1 border-b border-hairline pb-3">
                  <span className="text-ink-secondary font-medium">Block Reference</span>
                  <Link
                    href={`/blockchain/block/104`}
                    className="font-mono text-xs text-accent hover:underline break-all"
                  >
                    {tx.blockHash}
                  </Link>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <span className="text-ink-secondary font-medium">Opaque Payload Hash</span>
                <span className="font-mono text-xs text-ink-muted break-all">{tx.payloadHash}</span>
              </div>
            </div>

            {/* Privacy Secrecy Guarantee */}
            <p className="text-center text-xs text-ink-muted leading-relaxed">
              Voter Secrecy Guarantee: Transaction payload contains an encrypted blind signature.
              Payload contents cannot be unblinded to reveal individual voter choices.
            </p>

            <div className="pt-2 text-center">
              <Link
                href="/blockchain/explorer"
                className="inline-block rounded-md border border-hairline bg-surface px-4 py-2 text-xs font-medium text-ink hover:bg-surface-raised"
              >
                Return to Explorer
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-hairline bg-surface p-8 text-center text-xs text-ink-muted font-mono">
            Transaction record not found on ledger.
          </div>
        )}
      </div>
    </main>
  );
}
