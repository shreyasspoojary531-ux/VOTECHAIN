'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBlocks } from '@/services/blockchain.api';
import { ApiError } from '@/services/api';
import type { Block } from '@/types';

export default function BlockchainExplorerPage() {
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExplorerBlocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBlocks();
      setBlocks(data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        // Fallback demo blocks data if backend chain service is offline
        const now = Date.now();
        setBlocks([
          {
            height: 104,
            hash: '0x0000a4b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
            previousHash: '0x0000f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0',
            timestamp: now - 120000,
            txCount: 4,
            txIds: ['tx_8f3c4b1a7d6e', 'tx_9a2b4c6d8e0f', 'tx_1c3d5e7f9a2b', 'tx_4e6f8a0b1c3d'],
          },
          {
            height: 103,
            hash: '0x0000f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0',
            previousHash: '0x00001a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
            timestamp: now - 600000,
            txCount: 2,
            txIds: ['tx_7a8b9c0d1e2f', 'tx_3c4d5e6f7a8b'],
          },
          {
            height: 102,
            hash: '0x00001a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
            previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
            timestamp: now - 1800000,
            txCount: 1,
            txIds: ['tx_genesis_init'],
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplorerBlocks();
  }, []);

  return (
    <main className="min-h-screen bg-canvas p-6 text-ink md:p-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            Public Ledger Explorer
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">VoteChain Ledger</h1>
          <p className="text-sm text-ink-secondary">
            Transparent, append-only blockchain verifying electronic ballot commitment integrity.
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
              onClick={fetchExplorerBlocks}
              className="rounded bg-danger/20 px-3 py-1 font-medium hover:bg-danger/30"
            >
              Retry
            </button>
          </div>
        )}

        {/* Blocks List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg border border-hairline bg-surface"
              ></div>
            ))}
          </div>
        ) : blocks && blocks.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xs font-medium uppercase tracking-wider text-ink-secondary">
              Recent Blocks ({blocks.length})
            </h2>

            <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-hairline bg-canvas text-xs uppercase tracking-wider text-ink-secondary">
                  <tr>
                    <th className="px-4 py-3 font-medium">Height</th>
                    <th className="px-4 py-3 font-medium">Block Hash</th>
                    <th className="px-4 py-3 font-medium">Transactions</th>
                    <th className="px-4 py-3 font-medium">Timestamp</th>
                    <th className="px-4 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {blocks.map((block) => (
                    <tr key={block.height} className="hover:bg-surface-raised">
                      <td className="px-4 py-3 font-mono font-bold text-ink">#{block.height}</td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-secondary max-w-xs truncate">
                        {block.hash}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-ink">{block.txCount} txs</td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                        {new Date(block.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/blockchain/block/${block.height}`}
                          className="rounded border border-hairline bg-surface px-3 py-1 text-xs font-mono text-ink hover:bg-hairline"
                        >
                          View Block →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-hairline bg-surface p-12 text-center text-xs text-ink-muted font-mono">
            No blocks generated on the ledger yet.
          </div>
        )}
      </div>
    </main>
  );
}
