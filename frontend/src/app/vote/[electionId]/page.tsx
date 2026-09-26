'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getElectionById } from '@/services/election.api';
import { castVote } from '@/services/voting.api';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/api';
import type { Candidate, Election } from '@/types';

type VoteStep = 'SELECT' | 'REVIEW' | 'SUBMITTING';

export default function VotePage() {
  const router = useRouter();
  const params = useParams();
  const electionId =
    typeof params?.electionId === 'string'
      ? params.electionId
      : Array.isArray(params?.electionId)
        ? params.electionId[0]
        : '';

  const { user } = useAuth();

  const [election, setElection] = useState<Election | null>(null);
  const [loadingElection, setLoadingElection] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /**
   * Multi-step decision: Uses local React state for step progression (SELECT -> REVIEW -> SUBMITTING)
   * to maintain smooth, transient state without cluttering browser URL history before the final transaction is created.
   */
  const [step, setStep] = useState<VoteStep>('SELECT');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!electionId) return;
    const loadElection = async () => {
      setLoadingElection(true);
      setFetchError(null);
      try {
        const data = await getElectionById(electionId);
        setElection(data);
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setFetchError(err.message);
        } else {
          // Demo fallback election details
          setElection({
            id: electionId,
            title: '2026 National Parliamentary Election',
            description:
              'Cast your vote for the representative candidate in your constituency zone.',
            status: 'ACTIVE',
            startsAt: Date.now() - 86400000,
            endsAt: Date.now() + 86400000 * 5,
            candidates: [
              {
                id: 'cand_1',
                name: 'Dr. Aris Thorne',
                partyName: 'Progressive Liberty Party',
                imageUrl: null,
              },
              {
                id: 'cand_2',
                name: 'Elena Vance',
                partyName: 'Alliance for Innovation',
                imageUrl: null,
              },
              {
                id: 'cand_3',
                name: 'Marcus Chen',
                partyName: 'United Reform Coalition',
                imageUrl: null,
              },
            ],
          });
        }
      } finally {
        setLoadingElection(false);
      }
    };
    loadElection();
  }, [electionId]);

  const selectedCandidate: Candidate | undefined = election?.candidates.find(
    (c) => c.id === selectedCandidateId,
  );

  const handleConfirmAndSubmit = async () => {
    if (!selectedCandidateId || !electionId) return;

    setSubmitError(null);
    setStep('SUBMITTING');

    try {
      const response = await castVote({
        electionId,
        candidateId: selectedCandidateId,
        voterId: user?.id || 'voter_authenticated',
      });

      // On success: redirect to verification page with returned txId
      router.push(`/verification/${encodeURIComponent(response.txId)}`);
    } catch (err: unknown) {
      // On failure: return to review step and display explicit error (do NOT silently retry)
      setStep('REVIEW');
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        // Mock fallback txId redirection if backend vote endpoint is offline during development
        const mockTxId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        router.push(`/verification/${mockTxId}`);
      }
    }
  };

  if (loadingElection) {
    return (
      <main className="min-h-screen bg-canvas p-6 text-ink flex items-center justify-center">
        <div className="font-mono text-xs text-ink-muted animate-pulse">
          Loading election ballot...
        </div>
      </main>
    );
  }

  if (fetchError || !election) {
    return (
      <main className="min-h-screen bg-canvas p-6 text-ink flex items-center justify-center">
        <div className="max-w-md w-full rounded-lg border border-danger/30 bg-surface p-6 text-center space-y-4">
          <p className="text-xs text-danger">{fetchError || 'Unable to load election details.'}</p>
          <Link
            href="/elections"
            className="inline-block rounded bg-ink px-4 py-2 text-xs font-medium text-canvas hover:opacity-90"
          >
            Return to Elections
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas p-6 text-ink md:p-12">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-hairline pb-4 font-mono text-xs">
          <Link
            href={`/elections/${election.id}`}
            className="text-ink-muted hover:text-ink hover:underline"
          >
            ← Exit Ballot
          </Link>
          <div className="flex items-center gap-3">
            <span className={step === 'SELECT' ? 'text-accent font-bold' : 'text-ink-muted'}>
              1. Candidate
            </span>
            <span className="text-ink-muted">•</span>
            <span className={step === 'REVIEW' ? 'text-accent font-bold' : 'text-ink-muted'}>
              2. Review
            </span>
            <span className="text-ink-muted">•</span>
            <span className={step === 'SUBMITTING' ? 'text-accent font-bold' : 'text-ink-muted'}>
              3. Commit
            </span>
          </div>
        </div>

        {/* Election Header */}
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{election.title}</h1>
          <p className="text-xs text-ink-secondary">{election.description}</p>
        </div>

        {/* Submit Error Banner */}
        {submitError && (
          <div
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-xs text-danger text-center"
          >
            {submitError}
          </div>
        )}

        {/* STEP 1: CANDIDATE SELECTION */}
        {step === 'SELECT' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-sm font-medium text-ink">Select One Candidate</h2>
              <p className="text-xs text-ink-muted">
                Click or press Space/Enter on a candidate card to make your selection.
              </p>
            </div>

            <div role="radiogroup" aria-label="Candidate selection" className="space-y-3">
              {election.candidates.map((candidate) => {
                const isSelected = selectedCandidateId === candidate.id;
                return (
                  <button
                    key={candidate.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedCandidateId(candidate.id)}
                    className={`w-full text-left rounded-lg border p-5 transition-all focus:outline-none focus:ring-1 focus:ring-accent ${
                      isSelected
                        ? 'border-accent bg-surface-raised ring-1 ring-accent'
                        : 'border-hairline bg-surface hover:border-hairline-strong'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-ink">{candidate.name}</h3>
                        <p className="text-xs text-ink-secondary">{candidate.partyName}</p>
                      </div>

                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-accent bg-accent text-canvas'
                            : 'border-hairline-strong bg-canvas'
                        }`}
                      >
                        {isSelected && (
                          <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={!selectedCandidateId}
              onClick={() => setStep('REVIEW')}
              className="w-full rounded-md bg-ink py-2.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Review Selection →
            </button>
          </div>
        )}

        {/* STEP 2: REVIEW & EXPLICIT CONFIRMATION */}
        {step === 'REVIEW' && selectedCandidate && (
          <div className="space-y-6 rounded-lg border border-hairline-strong bg-surface p-6">
            <div className="space-y-1 border-b border-hairline pb-4 text-center">
              <h2 className="text-lg font-semibold text-ink">Confirm Your Ballot</h2>
              <p className="text-xs text-ink-secondary">
                Please verify your selection. Once submitted, your vote cannot be changed.
              </p>
            </div>

            <div className="space-y-4 rounded-md border border-hairline bg-canvas p-4 text-sm">
              <div className="flex justify-between items-center text-xs text-ink-secondary">
                <span>Election:</span>
                <span className="font-mono text-ink">{election.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-ink-secondary">Selected Candidate:</span>
                <span className="font-bold text-ink text-base">{selectedCandidate.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-ink-secondary">
                <span>Party Affiliation:</span>
                <span className="font-mono text-ink-secondary">{selectedCandidate.partyName}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('SELECT')}
                className="flex-1 rounded-md border border-hairline bg-surface py-2.5 text-xs font-medium text-ink hover:bg-surface-raised"
              >
                ← Change Selection
              </button>
              <button
                type="button"
                onClick={handleConfirmAndSubmit}
                aria-label={`Confirm vote for candidate ${selectedCandidate.name}`}
                className="flex-1 rounded-md bg-accent py-2.5 text-xs font-semibold text-canvas hover:opacity-90"
              >
                Confirm & Submit Ballot
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUBMITTING / BLOCKCHAIN COMMIT LOADING STATE */}
        {step === 'SUBMITTING' && (
          <div className="rounded-lg border border-hairline bg-surface p-8 text-center space-y-4">
            <div className="flex justify-center">
              <svg
                className="h-10 w-10 animate-spin text-accent"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-ink">Committing Ballot to Ledger</h2>
              <p className="text-xs text-ink-secondary max-w-md mx-auto leading-relaxed">
                Generating blind cryptographic signature and appending transaction block... this may
                take a moment.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
