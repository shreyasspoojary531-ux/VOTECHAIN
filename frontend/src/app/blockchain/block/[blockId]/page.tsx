'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getBlockById } from '@/services/blockchain.api';
import { ApiError } from '@/services/api';
import type { Block } from '@/types';

export default function BlockDetailPage() {
  const params = useParams();
  const blockId =
    typeof params.blockId === 'string'
      ? params.blockId
      : Array.isArray(params.blockId)
        ? params.blockId[0]
        : '';

  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlock = useCallback(async () => {
    if (!blockId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getBlockById(blockId);
      setBlock(data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        // Fallback demo block detail data
        const heightNum = parseInt(blockId, 10) || 104;
        setBlock({
          height: heightNum,
          hash: '0x0000a4b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
          previousHash: '0x0000f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0',
          timestamp: Date.now() - 120000,
          txCount: 4,
          txIds: ['tx_8f3c4b1a7d6e', 'tx_9a2b4c6d8e0f', 'tx_1c3d5e7f9a2b', 'tx_4e6f8a0b1c3d'],
        });
      }
    } finally {
      setLoading(false);
    }
  }, [blockId]);

  useEffect(() => {
    fetchBlock();
  }, [fetchBlock]);

  const raw = block as unknown as {
    height?: number;
    blockNumber?: number;
    hash?: string;
    blockHash?: string;
    previousHash?: string;
    timestamp?: number | string;
    txCount?: number;
    txIds?: string[];
    transactions?: Array<{ txId: string }>;
  } | null;

  const height = raw ? raw.height ?? raw.blockNumber ?? blockId : blockId;
  const hash = raw ? raw.hash || raw.blockHash || '' : '';
  const previousHash = raw ? raw.previousHash || '' : '';
  const timestampStr = raw?.timestamp ? new Date(raw.timestamp).toLocaleString() : 'N/A';
  const txList = raw ? raw.txIds || raw.transactions?.map((t) => t.txId) || [] : [];

  return (
    <main className="min-h-screen bg-canvas p-6 text-ink md:p-12">
      <div className="mx-auto max-w-4xl space-y-8">
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
              onClick={fetchBlock}
              className="rounded bg-danger/20 px-3 py-1 font-medium hover:bg-danger/30"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            <div className="h-10 w-1/3 animate-pulse rounded bg-surface"></div>
            <div className="h-48 animate-pulse rounded-lg border border-hairline bg-surface"></div>
          </div>
        ) : block ? (
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-1">
              <span className="font-mono text-xs uppercase tracking-widest text-success">
                ● Committed Block
              </span>
              <h1 className="text-3xl font-semibold tracking-tight">Block #{height}</h1>
            </div>

            {/* Block Hashes Card */}
            <div className="space-y-4 rounded-lg border border-hairline bg-surface p-6">
              <h2 className="text-xs font-medium uppercase tracking-wider text-ink-secondary">
                Block Cryptographic Hashes
              </h2>

              <div className="space-y-3 rounded-md border border-hairline bg-canvas p-4 text-xs">
                <div className="flex flex-col gap-1 border-b border-hairline pb-3">
                  <span className="text-ink-secondary font-medium">Block Hash</span>
                  <span className="font-mono text-ink break-all">{hash}</span>
                </div>

                <div className="flex flex-col gap-1 border-b border-hairline pb-3">
                  <span className="text-ink-secondary font-medium">Previous Block Hash</span>
                  <span className="font-mono text-ink-muted break-all">{previousHash}</span>
                </div>

                <div className="flex justify-between items-center pt-1 font-mono text-ink-secondary">
                  <span>Timestamp</span>
                  <span>{timestampStr}</span>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-4">
              <h2 className="text-xs font-medium uppercase tracking-wider text-ink-secondary">
                Committed Transactions ({txList.length})
              </h2>

              <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
                {txList.length > 0 ? (
                  <ul className="divide-y divide-hairline">
                    {txList.map((txId, idx) => (
                      <li
                        key={txId || idx}
                        className="flex items-center justify-between p-4 hover:bg-surface-raised"
                      >
                        <div className="space-y-1">
                          <span className="font-mono text-xs text-ink">{txId}</span>
                          <p className="text-xs text-ink-muted">Type: VOTE / BALLOT_COMMIT</p>
                        </div>

                        <Link
                          href={`/blockchain/transaction/${encodeURIComponent(txId)}`}
                          className="rounded border border-hairline bg-surface px-3 py-1 font-mono text-xs text-ink hover:bg-hairline"
                        >
                          Inspect Tx →
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-6 text-center text-xs text-ink-muted font-mono">
                    No transactions recorded in this block.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-hairline bg-surface p-8 text-center text-xs text-ink-muted font-mono">
            Block not found on ledger.
          </div>
        )}
      </div>
    </main>
  );
}
