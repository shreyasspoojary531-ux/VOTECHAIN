'use client';

import React, { useState } from 'react';

export interface JourneyStep {
  step: number;
  title: string;
  subtitle: string;
  codeSnippet: string;
  status: 'completed' | 'active' | 'pending';
  details: string;
}

const STEPS: JourneyStep[] = [
  {
    step: 1,
    title: 'Identity Authentication',
    subtitle: 'Aadhaar Hash + OTP Verification',
    codeSnippet: 'SHA256(Aadhaar) → BlindToken',
    status: 'completed',
    details: 'Voter proves citizenship & registration. Identity is cryptographically decoupled into a one-time voting token.',
  },
  {
    step: 2,
    title: 'Zero-Knowledge Eligibility Proof',
    subtitle: 'ZK-SNARK Proof Generation',
    codeSnippet: 'zkProof(VoterKey, ElectionID)',
    status: 'completed',
    details: 'Proves to the network that the voter is eligible for this specific election without linking their identity to the vote.',
  },
  {
    step: 3,
    title: 'Encrypted Ballot Payload',
    subtitle: 'Homomorphic Paillier Encryption',
    codeSnippet: 'Enc(CandidateID, ElectionPubKey)',
    status: 'completed',
    details: 'The selected candidate ID is encrypted on the client device using the public key of the election authority.',
  },
  {
    step: 4,
    title: 'Ledger Block Finalization',
    subtitle: 'Append-Only Blockchain Block',
    codeSnippet: 'Block#1429 • Tx: 0x8a1c...f4b2',
    status: 'completed',
    details: 'The transaction is submitted to the consensus network and immutably written into the latest block.',
  },
  {
    step: 5,
    title: 'Public Receipt Verification',
    subtitle: 'Universal Verifiability',
    codeSnippet: 'Verify(ReceiptID) == TRUE',
    status: 'completed',
    details: 'Voter receives an immutable transaction hash allowing them to verify their vote is counted in the tally.',
  },
];

export default function VoteJourneyVisual() {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <div className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-6 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-[#1f1f1f] mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#818cf8]" />
          <h3 className="text-sm font-medium text-[#f5f5f4]">Cryptographic Vote Journey</h3>
        </div>
        <span className="text-xs font-mono text-[#6b6b6b]">End-to-End Verifiable Protocol</span>
      </div>

      {/* Pipeline Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        {STEPS.map((s) => {
          const isActive = activeStep === s.step;

          return (
            <div
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer text-left ${
                isActive
                  ? 'border-[#818cf8] bg-[#141414] shadow-[0_0_12px_rgba(129,140,248,0.12)]'
                  : 'border-[#1f1f1f] bg-[#0a0a0a] hover:border-[#262626] hover:bg-[#141414]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1f1f1f] text-[#818cf8]">
                  0{s.step}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
              </div>
              <h4 className="text-xs font-medium text-[#f5f5f4] truncate">{s.title}</h4>
              <p className="text-[10px] font-mono text-[#6b6b6b] truncate mt-1">{s.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Selected Step Expanded Code & Explanation */}
      {(() => {
        const stepData = STEPS.find((s) => s.step === activeStep);
        if (!stepData) return null;

        return (
          <div className="p-4 rounded-lg border border-[#262626] bg-[#141414] font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-2 text-[#a3a3a3]">
              <span className="text-[#818cf8] font-bold">
                STEP 0{stepData.step}: {stepData.title.toUpperCase()}
              </span>
              <span className="text-[#34d399] text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#34d399]/10">
                Verified Cryptographically
              </span>
            </div>

            <p className="text-[#f5f5f4] font-sans text-sm leading-relaxed">{stepData.details}</p>

            <div className="p-3 rounded bg-[#000000] border border-[#1f1f1f] flex items-center justify-between text-[#34d399]">
              <span>{stepData.codeSnippet}</span>
              <span className="text-[#6b6b6b] text-[10px]">OUTPUT_STATE: VALID</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
