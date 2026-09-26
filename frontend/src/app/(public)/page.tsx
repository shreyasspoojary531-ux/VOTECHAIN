'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans selection:bg-accent/30 flex flex-col relative overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6 max-w-7xl mx-auto w-full">
        {/* Background Hero Texture */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <Image
            src="/bg-hero-1.webp"
            alt="Hero Background Texture"
            fill
            priority
            className="object-cover object-bottom opacity-60"
          />
          {/* Scrim Overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-canvas via-canvas/60 to-canvas" />
        </div>

        {/* Hero Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Asymmetric Resend Heading & Action Row */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
            {/* Announcement Badge */}
            <Link
              href="/blockchain/explorer"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline-strong bg-surface/80 backdrop-blur-sm text-xs text-ink-secondary hover:border-accent/40 transition-colors mb-6 group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span>VoteChain Protocol 2.0</span>
              <span className="text-accent group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </Link>

            {/* Hero Heading */}
            <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.08] text-ink max-w-2xl">
              Trustless Elections. Secured by Proofs.
            </h1>

            {/* Supporting Subtext */}
            <p className="mt-6 text-base sm:text-lg text-ink-secondary max-w-xl font-sans leading-relaxed">
              VoteChain decouples voter identity from ballot payload using Zero-Knowledge proofs and
              Aadhaar verification. Every vote is mathematically sealed and publicly audited on-chain.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex items-center gap-5">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-ink text-canvas font-medium text-xs px-5 py-2.5 hover:bg-neutral-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Get started
              </Link>
              <Link
                href="/elections"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm px-1 py-0.5"
              >
                <span>Browse Active Elections</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Anchor (Abstract SVG Illustration) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end z-10">
            {/* TODO: replace with final voting illustration asset */}
            <div className="relative w-full max-w-md p-6 resend-card border border-hairline/80 shadow-2xl">
              {/* Abstract Voting Graphic SVG */}
              <div className="space-y-4">
                {/* Header bar of graphic */}
                <div className="flex items-center justify-between pb-3 border-b border-hairline">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                    <span className="font-mono text-xs text-ink-secondary">
                      BALLOT_PROOF #4092
                    </span>
                  </div>
                  <span className="font-mono text-[10px] bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" /> Verified
                  </span>
                </div>

                {/* Ballot Card Representation */}
                <div className="p-4 bg-surface-raised rounded-md border border-hairline space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-ink-secondary font-mono">ELECTION_ID</span>
                    <span className="font-mono text-ink text-[11px] bg-canvas px-2 py-0.5 rounded border border-hairline">
                      IND-GOV-2026
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-ink-secondary font-mono">BALLOT_HASH</span>
                    <span className="font-mono text-ink-muted text-[11px] truncate max-w-[160px]">
                      0x8f3a92...b41e
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-ink-secondary font-mono">ZK_PROOF</span>
                    <span className="font-mono text-accent text-[11px] flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5 text-accent"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Valid (Groth16)
                    </span>
                  </div>
                </div>

                {/* Stack of block cards suggesting ledger linkage */}
                <div className="space-y-2 pt-1">
                  <div className="p-2.5 bg-canvas/80 rounded border border-hairline/60 flex items-center justify-between text-[11px] font-mono text-ink-muted">
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span>BLOCK #48,192</span>
                    </div>
                    <span className="text-success text-[10px]">MINTED</span>
                  </div>

                  <div className="p-2.5 bg-canvas/40 rounded border border-hairline/30 flex items-center justify-between text-[11px] font-mono text-ink-muted/60">
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-ink-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span>BLOCK #48,191</span>
                    </div>
                    <span className="text-[10px]">IMMUTABLE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORTING SECTION: Live Vote Audit Timeline (Echoes Resend Image 4 UI) */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full border-t border-hairline/40">
        <div className="mb-12 space-y-2">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            Live Ledger Activity
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl text-ink font-normal">
            Real-Time Audit Trail & Proof Verification
          </h2>
          <p className="text-sm text-ink-secondary max-w-xl">
            Watch anonymous ballots progress seamlessly from identity-decoupled signature generation to block anchoring.
          </p>
        </div>

        {/* Resend Style Timeline UI Card */}
        <div className="resend-card p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
          {/* Timeline Feed Container */}
          <div className="space-y-6 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-[1px] before:bg-hairline-strong">
            {/* Timeline Item 1: Verified */}
            <div className="relative pl-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="absolute left-2 top-1 -translate-x-1/2 w-4 h-4 rounded-full bg-surface border border-success flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status Badge Pill */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Verified
                </span>

                {/* Monospace Identifier Chips */}
                <span className="text-xs text-ink-secondary font-mono">ballot</span>
                <span className="font-mono text-xs bg-surface-raised px-2 py-0.5 rounded border border-hairline text-ink">
                  0x7f8a3c4f...b653
                </span>
                <span className="text-xs text-ink-secondary font-mono">confirmed on</span>
                <span className="font-mono text-xs bg-surface-raised px-2 py-0.5 rounded border border-hairline text-ink flex items-center gap-1">
                  <span>⚡</span> Hyperledger
                </span>
              </div>

              <div className="font-mono text-xs text-ink-muted">
                Sep 26 22:38:04
              </div>
            </div>

            {/* Timeline Item 2: Recorded */}
            <div className="relative pl-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="absolute left-2 top-1 -translate-x-1/2 w-4 h-4 rounded-full bg-surface border border-accent flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status Badge Pill */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Recorded
                </span>

                {/* Monospace Identifier Chips */}
                <span className="text-xs text-ink-secondary font-mono">tx</span>
                <span className="font-mono text-xs bg-surface-raised px-2 py-0.5 rounded border border-hairline text-ink">
                  tx_2bbda36b_d346
                </span>
                <span className="text-xs text-ink-secondary font-mono">with hash</span>
                <span className="font-mono text-xs bg-surface-raised px-2 py-0.5 rounded border border-hairline text-ink">
                  0xa2aa0305...0776
                </span>
              </div>

              <div className="font-mono text-xs text-ink-muted">
                Sep 26 22:37:59
              </div>
            </div>

            {/* Timeline Item 3: Consensus Pending */}
            <div className="relative pl-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="absolute left-2 top-1 -translate-x-1/2 w-4 h-4 rounded-full bg-surface border border-warning flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status Badge Pill */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                  Consensus In-Progress
                </span>

                {/* Monospace Identifier Chips */}
                <span className="text-xs text-ink-secondary font-mono">node</span>
                <span className="font-mono text-xs bg-surface-raised px-2 py-0.5 rounded border border-hairline text-ink">
                  peer0.org1.votechain.net
                </span>
                <span className="text-xs text-ink-secondary font-mono">block</span>
                <span className="font-mono text-xs bg-surface-raised px-2 py-0.5 rounded border border-hairline text-ink">
                  #48,193
                </span>
              </div>

              <div className="font-mono text-xs text-ink-muted">
                Sep 26 22:37:45
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIGHT-MODE AUDIT SHOWCASE SECTION (bg-light.webp) */}
      <section className="relative py-24 md:py-32 px-6 w-full">
        {/* Blended Transition Gradient from Dark to Light */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-canvas via-canvas/90 to-transparent z-10 pointer-events-none" />

        {/* Light Section Container */}
        <div className="relative max-w-7xl mx-auto rounded-3xl overflow-hidden border border-neutral-200/40 shadow-2xl">
          {/* Ambient Texture Image */}
          <Image
            src="/bg-light.webp"
            alt="Light Audit Background"
            fill
            className="object-cover object-center"
          />

          {/* Light Section Scrim & Content Card */}
          <div className="relative z-10 bg-white/75 backdrop-blur-xl p-8 sm:p-12 md:p-16 text-neutral-900 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block px-3 py-1 rounded-full bg-neutral-900/10 text-neutral-900 font-mono text-xs font-semibold">
                PUBLIC AUDITABILITY
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-normal text-neutral-950 tracking-tight leading-tight">
                Inspect Every Proof Without Exposing Who Voted.
              </h2>
              <p className="text-base text-neutral-700 leading-relaxed font-sans max-w-xl">
                Anyone can verify election integrity directly on the public block explorer. Voters receive cryptographic receipts that prove their ballot was included without disclosing their choice.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/blockchain/explorer"
                  className="inline-flex items-center justify-center rounded-full bg-neutral-950 text-white font-medium text-xs px-5 py-2.5 hover:bg-neutral-800 transition-colors shadow-md"
                >
                  Explore Public Ledger →
                </Link>
                <Link
                  href="/verification"
                  className="inline-flex items-center justify-center text-xs font-semibold text-neutral-800 hover:text-neutral-950 transition-colors"
                >
                  Verify Ballot Receipt
                </Link>
              </div>
            </div>

            {/* Right Card Feature Callouts */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 bg-white/90 rounded-2xl border border-neutral-200/90 shadow-sm space-y-1">
                <div className="font-mono text-xs text-neutral-500 uppercase tracking-wider">01 // Zero-Knowledge Nullifiers</div>
                <div className="font-semibold text-sm text-neutral-900">Prevent Double Voting</div>
                <p className="text-xs text-neutral-600">Deterministic nullifiers ensure each voter casts exactly one valid vote without linking to identity.</p>
              </div>

              <div className="p-5 bg-white/90 rounded-2xl border border-neutral-200/90 shadow-sm space-y-1">
                <div className="font-mono text-xs text-neutral-500 uppercase tracking-wider">02 // Homomorphic Tallying</div>
                <div className="font-semibold text-sm text-neutral-900">Encrypted Vote Summation</div>
                <p className="text-xs text-neutral-600">Tally results are aggregated mathematically while individual votes remain encrypted end-to-end.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Blended Transition Gradient from Light back to Dark */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-canvas via-canvas/90 to-transparent z-10 pointer-events-none" />
      </section>

      {/* QUICK ROLE PORTALS */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full border-t border-hairline/60">
        <div className="text-xs font-mono text-ink-muted uppercase tracking-widest mb-6">
          Role Portals
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <Link
            href="/elections"
            className="p-4 rounded-lg border border-hairline bg-surface hover:border-accent hover:bg-surface-raised transition-all group"
          >
            <div className="text-accent font-bold group-hover:underline">VOTER PORTAL →</div>
            <div className="text-ink-muted text-[11px] mt-1">Cast & verify ballot</div>
          </Link>

          <Link
            href="/registrar/dashboard"
            className="p-4 rounded-lg border border-hairline bg-surface hover:border-success hover:bg-surface-raised transition-all group"
          >
            <div className="text-success font-bold group-hover:underline">REGISTRAR PORTAL →</div>
            <div className="text-ink-muted text-[11px] mt-1">Aadhaar identity verification</div>
          </Link>

          <Link
            href="/admin/dashboard"
            className="p-4 rounded-lg border border-hairline bg-surface hover:border-warning hover:bg-surface-raised transition-all group"
          >
            <div className="text-warning font-bold group-hover:underline">ADMIN PORTAL →</div>
            <div className="text-ink-muted text-[11px] mt-1">Election lifecycle & tallies</div>
          </Link>

          <Link
            href="/audit/dashboard"
            className="p-4 rounded-lg border border-hairline bg-surface hover:border-danger hover:bg-surface-raised transition-all group"
          >
            <div className="text-danger font-bold group-hover:underline">AUDITOR PORTAL →</div>
            <div className="text-ink-muted text-[11px] mt-1">Ledger reconciliation</div>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-hairline bg-surface px-6 py-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs font-mono text-ink-muted space-y-4 md:space-y-0">
          <div>VoteChain Protocol • Cryptographically Verifiable & Open Ledger</div>
          <div className="flex space-x-6">
            <Link href="/blockchain/explorer" className="hover:text-ink transition-colors">
              Explorer
            </Link>
            <Link href="/audit/dashboard" className="hover:text-ink transition-colors">
              Audit
            </Link>
            <Link href="/elections" className="hover:text-ink transition-colors">
              Elections
            </Link>
            <Link href="/verification" className="hover:text-ink transition-colors">
              Verify
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
