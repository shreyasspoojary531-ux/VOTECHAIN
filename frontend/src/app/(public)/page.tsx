'use client';

import React from 'react';
import Link from 'next/link';
import VoteJourneyVisual from '@/components/visuals/vote-journey-visual';
import ChainVisual from '@/components/visuals/chain-visual';
import PrivacyArchitectureVisual from '@/components/visuals/privacy-architecture-visual';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#000000] text-[#f5f5f4] font-sans selection:bg-[#818cf8]/30">
      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-28 max-w-6xl mx-auto border-b border-[#1f1f1f]">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-[#818cf8]/30 bg-[#818cf8]/10 text-xs font-mono text-[#818cf8] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#818cf8] animate-pulse" />
          <span>Cryptographically Verifiable & Decoupled E-Voting Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-tight text-[#f5f5f4] leading-[1.1] max-w-4xl font-normal">
          Trustless Elections Secured by Immutable Proofs.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#a3a3a3] max-w-2xl font-sans leading-relaxed">
          VoteChain decouples voter identity from ballot payload using Zero-Knowledge proofs and Aadhaar verification. Every vote is mathematically sealed and publicly audited on-chain.
        </p>

        <div className="mt-8 flex flex-wrap gap-4 items-center">
          <Link href="/elections">
            <Button size="lg" className="font-mono text-xs">
              Browse Active Elections →
            </Button>
          </Link>
          <Link href="/blockchain/explorer">
            <Button variant="secondary" size="lg" className="font-mono text-xs">
              Inspect Public Ledger
            </Button>
          </Link>
        </div>

        {/* Quick Role Portals Bar */}
        <div className="mt-16 pt-8 border-t border-[#1f1f1f] grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <Link
            href="/elections"
            className="p-3 rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] hover:border-[#818cf8] hover:bg-[#141414] transition-all group"
          >
            <div className="text-[#818cf8] font-bold group-hover:underline">VOTER PORTAL →</div>
            <div className="text-[#6b6b6b] text-[10px] mt-1">Cast & verify ballot</div>
          </Link>

          <Link
            href="/registrar/dashboard"
            className="p-3 rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] hover:border-[#34d399] hover:bg-[#141414] transition-all group"
          >
            <div className="text-[#34d399] font-bold group-hover:underline">REGISTRAR PORTAL →</div>
            <div className="text-[#6b6b6b] text-[10px] mt-1">Aadhaar identity verification</div>
          </Link>

          <Link
            href="/admin/dashboard"
            className="p-3 rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] hover:border-[#fbbf24] hover:bg-[#141414] transition-all group"
          >
            <div className="text-[#fbbf24] font-bold group-hover:underline">ADMIN PORTAL →</div>
            <div className="text-[#6b6b6b] text-[10px] mt-1">Election lifecycle & tallies</div>
          </Link>

          <Link
            href="/audit/dashboard"
            className="p-3 rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] hover:border-[#f87171] hover:bg-[#141414] transition-all group"
          >
            <div className="text-[#f87171] font-bold group-hover:underline">AUDITOR PORTAL →</div>
            <div className="text-[#6b6b6b] text-[10px] mt-1">Ledger reconciliation</div>
          </Link>
        </div>
      </section>

      {/* Visual Architecture Showcase Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto space-y-16">
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-widest text-[#818cf8]">
            System Architecture & Proofs
          </p>
          <h2 className="text-2xl md:text-3xl font-serif text-[#f5f5f4]">
            How VoteChain Guarantees Privacy & Verifiability
          </h2>
        </div>

        {/* 1. Vote Journey Visual */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono text-[#a3a3a3] uppercase tracking-wider">
              01 // Cryptographic Vote Journey
            </h3>
            <span className="text-xs font-mono text-[#6b6b6b]">End-to-End Pipeline</span>
          </div>
          <VoteJourneyVisual />
        </div>

        {/* 2. Privacy Architecture Visual */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono text-[#a3a3a3] uppercase tracking-wider">
              02 // Privacy & Identity Decoupling
            </h3>
            <span className="text-xs font-mono text-[#6b6b6b]">Zero PII Storage</span>
          </div>
          <PrivacyArchitectureVisual />
        </div>

        {/* 3. Chain Linkage Visual */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono text-[#a3a3a3] uppercase tracking-wider">
              03 // Immutable Chain Linkage
            </h3>
            <span className="text-xs font-mono text-[#6b6b6b]">Proof of Authority Consensus</span>
          </div>
          <ChainVisual />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1f1f1f] bg-[#0a0a0a] px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs font-mono text-[#6b6b6b] space-y-4 md:space-y-0">
          <div>VoteChain Protocol • Immutable & Open Ledger</div>
          <div className="flex space-x-6">
            <Link href="/blockchain/explorer" className="hover:text-[#f5f5f4]">
              Explorer
            </Link>
            <Link href="/audit/dashboard" className="hover:text-[#f5f5f4]">
              Audit
            </Link>
            <Link href="/elections" className="hover:text-[#f5f5f4]">
              Elections
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
