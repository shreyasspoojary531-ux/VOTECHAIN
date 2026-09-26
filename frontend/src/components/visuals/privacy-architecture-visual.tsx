'use client';

import React from 'react';

export default function PrivacyArchitectureVisual() {
  return (
    <div className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-6 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-[#1f1f1f] mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />
          <h3 className="text-sm font-medium text-[#f5f5f4]">
            Identity-Ballot Decoupling Architecture
          </h3>
        </div>
        <span className="text-xs font-mono text-[#6b6b6b]">Zero Aadhaar Storage On-Chain</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Left Node: Citizen PII (Isolated) */}
        <div className="p-4 rounded-lg border border-[#f87171]/30 bg-[#f87171]/5 space-y-2 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-[#f87171] font-bold">PII Identity Zone</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f87171]/20 text-[#f87171]">
              ISOLATED
            </span>
          </div>
          <ul className="text-xs font-mono text-[#a3a3a3] space-y-1">
            <li>• Aadhaar Last-4</li>
            <li>• Mobile OTP Session</li>
            <li>• Voter ID Registration</li>
          </ul>
          <div className="text-[10px] font-mono text-[#6b6b6b] pt-2 border-t border-[#f87171]/20">
            Never written to blockchain
          </div>
        </div>

        {/* Center Node: Cryptographic Blind Bridge */}
        <div className="p-4 rounded-lg border border-[#fbbf24]/40 bg-[#141414] text-center relative">
          <div className="text-[10px] font-mono text-[#fbbf24] uppercase tracking-wider mb-1 font-bold">
            Zero-Knowledge Bridge
          </div>
          <div className="w-8 h-8 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/40 flex items-center justify-center mx-auto my-2 text-[#fbbf24] font-mono text-sm">
            ZK
          </div>
          <div className="text-xs font-mono text-[#f5f5f4]">Blind Token Generator</div>
          <p className="text-[10px] font-mono text-[#6b6b6b] mt-1">
            Destroys identity link while verifying single-vote eligibility
          </p>
        </div>

        {/* Right Node: Anonymous Blockchain Ledger */}
        <div className="p-4 rounded-lg border border-[#34d399]/30 bg-[#34d399]/5 space-y-2 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-[#34d399] font-bold">Public Ledger Zone</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#34d399]/20 text-[#34d399]">
              PUBLIC
            </span>
          </div>
          <ul className="text-xs font-mono text-[#a3a3a3] space-y-1">
            <li>• Nullifier Hash</li>
            <li>• Encrypted Ballot Payload</li>
            <li>• Immutable Block Receipt</li>
          </ul>
          <div className="text-[10px] font-mono text-[#6b6b6b] pt-2 border-t border-[#34d399]/20">
            100% Mathematically Anonymous
          </div>
        </div>
      </div>
    </div>
  );
}
