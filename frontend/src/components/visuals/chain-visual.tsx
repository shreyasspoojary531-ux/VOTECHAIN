'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export interface BlockVisualData {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: string;
  txCount: number;
}

interface ChainVisualProps {
  blocks?: BlockVisualData[];
  interactive?: boolean;
}

const DEFAULT_BLOCKS: BlockVisualData[] = [
  {
    index: 0,
    hash: '0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
    previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    timestamp: '2026-09-26T10:00:00Z',
    txCount: 1,
  },
  {
    index: 1,
    hash: '0x0000000000028a412f7188732df3a4bc043818e578c772074e64f7b6058d8391',
    previousHash: '0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
    timestamp: '2026-09-26T10:05:12Z',
    txCount: 42,
  },
  {
    index: 2,
    hash: '0x0000000000057c39e21820b98741369f82d1c72f10d944c680f4981144a95400',
    previousHash: '0x0000000000028a412f7188732df3a4bc043818e578c772074e64f7b6058d8391',
    timestamp: '2026-09-26T10:10:45Z',
    txCount: 118,
  },
  {
    index: 3,
    hash: '0x0000000000019b846e4905f11a8b9e843c0897261a91e53820fa49320b91e704',
    previousHash: '0x0000000000057c39e21820b98741369f82d1c72f10d944c680f4981144a95400',
    timestamp: '2026-09-26T10:16:30Z',
    txCount: 89,
  },
];

export default function ChainVisual({ blocks = DEFAULT_BLOCKS, interactive = true }: ChainVisualProps) {
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [hoveredHash, setHoveredHash] = useState<string | null>(null);

  return (
    <div className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-6 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-[#1f1f1f] mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#34d399] animate-pulse" />
          <h3 className="text-sm font-medium text-[#f5f5f4]">Immutable Chain Linkage</h3>
        </div>
        <span className="text-xs font-mono text-[#6b6b6b]">
          {blocks.length} Blocks Linked • Proof of Authority
        </span>
      </div>

      {/* Horizontal chain flow */}
      <div className="relative overflow-x-auto pb-4 pt-2 scrollbar-thin scrollbar-thumb-[#1f1f1f]">
        <div className="flex items-center min-w-max space-x-0">
          {blocks.map((block, idx) => {
            const isSelected = selectedBlock === block.index;
            const isPrevLinked = hoveredHash && block.previousHash === hoveredHash;
            const isSelfHovered = hoveredHash && block.hash === hoveredHash;

            return (
              <React.Fragment key={block.index}>
                {/* Block Card Node */}
                <div
                  className={`relative group w-64 p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-[#818cf8] bg-[#141414] shadow-[0_0_15px_rgba(129,140,248,0.15)]'
                      : isPrevLinked || isSelfHovered
                      ? 'border-[#34d399] bg-[#141414]'
                      : 'border-[#1f1f1f] bg-[#0a0a0a] hover:border-[#262626] hover:bg-[#141414]'
                  }`}
                  onClick={() => interactive && setSelectedBlock(isSelected ? null : block.index)}
                  onMouseEnter={() => setHoveredHash(block.hash)}
                  onMouseLeave={() => setHoveredHash(null)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1f1f1f] text-[#818cf8]">
                      BLOCK #{block.index}
                    </span>
                    <span className="text-xs font-mono text-[#6b6b6b]">
                      {block.txCount} txs
                    </span>
                  </div>

                  {/* Hash indicator */}
                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <div className="text-[10px] text-[#6b6b6b] uppercase tracking-wider mb-0.5">Hash</div>
                      <div
                        className={`truncate px-1.5 py-1 rounded transition-colors ${
                          isSelfHovered ? 'bg-[#34d399]/10 text-[#34d399]' : 'text-[#f5f5f4] bg-[#141414]'
                        }`}
                        title={block.hash}
                      >
                        {block.hash.slice(0, 10)}...{block.hash.slice(-8)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-[#6b6b6b] uppercase tracking-wider mb-0.5">Prev Hash</div>
                      <div
                        className={`truncate px-1.5 py-1 rounded transition-colors ${
                          isPrevLinked ? 'bg-[#34d399]/20 text-[#34d399] font-bold' : 'text-[#6b6b6b] bg-[#0a0a0a]'
                        }`}
                        title={block.previousHash}
                      >
                        {block.previousHash === '0x0000000000000000000000000000000000000000000000000000000000000000'
                          ? 'GENESIS_PREV_ZERO'
                          : `${block.previousHash.slice(0, 8)}...${block.previousHash.slice(-6)}`}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#1f1f1f] flex justify-between items-center text-[10px] font-mono text-[#6b6b6b]">
                    <span>{new Date(block.timestamp).toLocaleTimeString()}</span>
                    <Link
                      href={`/blockchain/block/${block.index}`}
                      className="text-[#818cf8] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View →
                    </Link>
                  </div>
                </div>

                {/* Linking Arrow/Line */}
                {idx < blocks.length - 1 && (
                  <div className="flex flex-col items-center px-2">
                    <div
                      className={`h-0.5 w-10 transition-colors duration-200 ${
                        hoveredHash &&
                        (blocks[idx].hash === hoveredHash || blocks[idx + 1].previousHash === hoveredHash)
                          ? 'bg-[#34d399]'
                          : 'bg-[#1f1f1f]'
                      }`}
                    />
                    <span className="text-[9px] font-mono text-[#6b6b6b] mt-1">prev_hash</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Detail panel when block clicked */}
      {selectedBlock !== null && (
        <div className="mt-4 p-4 rounded-lg border border-[#262626] bg-[#141414] text-xs font-mono space-y-2 animate-fadeIn">
          <div className="flex justify-between items-center text-[#a3a3a3]">
            <span className="text-[#818cf8] font-bold">Selected Block Details</span>
            <button
              onClick={() => setSelectedBlock(null)}
              className="text-[#6b6b6b] hover:text-[#f5f5f4]"
            >
              ✕ Close
            </button>
          </div>
          {(() => {
            const b = blocks.find((item) => item.index === selectedBlock);
            if (!b) return null;
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[#f5f5f4]">
                <div>
                  <span className="text-[#6b6b6b]">Block Index: </span>
                  {b.index}
                </div>
                <div>
                  <span className="text-[#6b6b6b]">Transactions: </span>
                  {b.txCount}
                </div>
                <div className="col-span-2">
                  <span className="text-[#6b6b6b]">Block Hash: </span>
                  <span className="text-[#34d399] break-all">{b.hash}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#6b6b6b]">Previous Block Hash: </span>
                  <span className="text-[#a3a3a3] break-all">{b.previousHash}</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
