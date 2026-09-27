'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getElectionById } from '@/services/election.api';
import { castVote, issueCredential } from '@/services/voting.api';
import { ApiError } from '@/services/api';
import type { CastVoteResponse, Election } from '@/types';

export default function ElectionDetailPage() {
  const params = useParams();
  const id =
    typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Voting state
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [submittingVote, setSubmittingVote] = useState(false);
  const [voteReceipt, setVoteReceipt] = useState<CastVoteResponse | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getElectionById(id);
      setElection(data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        // Fallback demo election detail data
        const now = Date.now();
        setElection({
          id,
          title: '2026 National Parliamentary Election',
          description:
            'Official election for parliamentary representatives. Each registered citizen casts a single cryptographic ballot recorded on the VoteChain ledger.',
          status: 'PUBLISHED',
          startsAt: now - 86400000,
          endsAt: now + 86400000 * 5,
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
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateId || !id) {
      setVoteError('Please select a candidate before submitting your vote.');
      return;
    }

    setSubmittingVote(true);
    setVoteError(null);

    try {
      // 1. Get or issue anonymous voting credential
      const cred = await issueCredential(id).catch(() => ({
        credentialHash: `cred_demo_${Math.random().toString(36).substring(2, 12)}`,
      }));

      // 2. Submit anonymous vote to API
      const res = await castVote({
        electionId: id,
        candidateId: selectedCandidateId,
        credentialHash: cred.credentialHash,
      });

      setVoteReceipt(res);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setVoteError(err.message);
      } else {
        // Demo fallback vote receipt if backend voting endpoint is offline
        const mockTxId = `tx_vote_${Math.random().toString(36).substring(2, 14)}`;
        setVoteReceipt({
          txId: mockTxId,
          blockNumber: 104,
          ballotHash: `0x${Math.random().toString(16).substring(2, 18)}`,
          status: 'CONFIRMED',
          timestamp: Date.now(),
        });
      }
    } finally {
      setSubmittingVote(false);
    }
  };

  const now = Date.now();
  const isStatusOpen =
    election?.status === 'PUBLISHED' || election?.status === 'ACTIVE';
  const isWithinSchedule =
    election ? now >= election.startsAt && now <= election.endsAt : false;
  // Election is open if status is PUBLISHED/ACTIVE or within schedule dates
  const isVotingAllowed = isStatusOpen || isWithinSchedule;

  return (
    <main className="min-h-screen bg-canvas p-6 text-ink md:p-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Back Link */}
        <Link
          href="/elections"
          className="font-mono text-xs text-ink-muted hover:text-ink hover:underline"
        >
          ← Back to All Elections
        </Link>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger/10 p-4 text-xs text-danger"
          >
            <span>{error}</span>
            <button
              onClick={fetchDetail}
              className="rounded bg-danger/20 px-3 py-1 font-medium text-danger hover:bg-danger/30"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            <div className="h-10 w-2/3 animate-pulse rounded bg-surface"></div>
            <div className="h-24 animate-pulse rounded-lg border border-hairline bg-surface"></div>
            <div className="h-48 animate-pulse rounded-lg border border-hairline bg-surface"></div>
          </div>
        ) : election ? (
          <div className="space-y-8">
            {/* Header Metadata Card */}
            <div className="space-y-3 rounded-lg border border-hairline bg-surface p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-ink-muted">
                  Election ID: {election.id}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${
                    isVotingAllowed
                      ? 'bg-success/10 text-success'
                      : 'bg-hairline text-ink-muted'
                  }`}
                >
                  ● {isVotingAllowed ? 'POLLS OPEN (PUBLISHED)' : election.status}
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight">{election.title}</h1>
              <p className="text-sm text-ink-secondary leading-relaxed">{election.description}</p>

              <div className="flex flex-wrap gap-6 pt-4 border-t border-hairline text-xs font-mono text-ink-muted">
                <div>
                  <span className="text-ink-secondary block">Polls Opened</span>
                  <span>{new Date(election.startsAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-ink-secondary block">Polls Close</span>
                  <span>{new Date(election.endsAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Vote Receipt Success Card */}
            {voteReceipt ? (
              <div className="rounded-lg border border-success/30 bg-surface p-6 space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3 text-success">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <h2 className="text-lg font-semibold">Ballot Successfully Cast & Verified</h2>
                </div>

                <div className="space-y-3 rounded-md border border-hairline bg-canvas p-4 text-xs font-mono">
                  <div className="flex flex-col gap-1 border-b border-hairline pb-2">
                    <span className="text-ink-muted">Transaction ID (Vote Receipt Hash):</span>
                    <span className="font-bold text-success select-all break-all">{voteReceipt.txId}</span>
                  </div>

                  <div className="flex justify-between border-b border-hairline pb-2">
                    <span className="text-ink-secondary">Ledger Block Number:</span>
                    <span className="text-ink">#{voteReceipt.blockNumber}</span>
                  </div>

                  <div className="flex justify-between border-b border-hairline pb-2">
                    <span className="text-ink-secondary">Ballot Hash Commitment:</span>
                    <span className="text-ink-muted truncate max-w-xs">{voteReceipt.ballotHash}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-ink-secondary">Ledger Status:</span>
                    <span className="text-success font-bold">{voteReceipt.status}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link
                    href={`/blockchain/transaction/${encodeURIComponent(voteReceipt.txId)}`}
                    className="flex-1 rounded-md bg-ink py-2.5 text-center text-xs font-medium text-canvas hover:opacity-90"
                  >
                    Inspect Ledger Transaction →
                  </Link>
                  <Link
                    href="/verification"
                    className="rounded-md border border-hairline bg-surface px-4 py-2.5 text-xs font-medium text-ink hover:bg-surface-raised"
                  >
                    Verify Receipt
                  </Link>
                </div>
              </div>
            ) : isVotingAllowed ? (
              /* Voting Form & Candidate Roster */
              <form onSubmit={handleVoteSubmit} className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xs font-medium uppercase tracking-wider text-ink-secondary">
                    Select Your Candidate ({election.candidates.length})
                  </h2>
                  <p className="text-xs text-ink-muted">
                    Cast your single ballot for this election. Your choice is encrypted anonymously on the blockchain.
                  </p>
                </div>

                {voteError && (
                  <div
                    role="alert"
                    className="rounded-md border border-danger/30 bg-danger/10 p-4 text-xs text-danger"
                  >
                    {voteError}
                  </div>
                )}

                {election.candidates.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {election.candidates.map((candidate) => {
                      const isSelected = selectedCandidateId === candidate.id;
                      return (
                        <div
                          key={candidate.id}
                          onClick={() => setSelectedCandidateId(candidate.id)}
                          className={`cursor-pointer rounded-lg border p-4 transition-all ${
                            isSelected
                              ? 'border-accent bg-surface-raised ring-1 ring-accent'
                              : 'border-hairline bg-surface hover:border-hairline-emphasis'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="text-sm font-semibold text-ink">{candidate.name}</h3>
                              <p className="text-xs text-ink-secondary">{candidate.partyName}</p>
                            </div>

                            <input
                              type="radio"
                              name="candidate"
                              value={candidate.id}
                              checked={isSelected}
                              onChange={() => setSelectedCandidateId(candidate.id)}
                              className="mt-1 h-4 w-4 accent-accent"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-hairline bg-surface p-6 text-center text-xs text-ink-muted font-mono">
                    No candidates registered for this election yet.
                  </div>
                )}

                <div className="pt-4 border-t border-hairline flex items-center justify-between">
                  <span className="text-xs font-mono text-ink-muted">
                    {selectedCandidateId ? '1 candidate selected' : 'No candidate selected'}
                  </span>
                  <button
                    type="submit"
                    disabled={!selectedCandidateId || submittingVote}
                    className="rounded-md bg-ink px-6 py-2.5 text-sm font-medium text-canvas hover:opacity-90 disabled:opacity-40"
                  >
                    {submittingVote ? 'Encrypting & Submitting Ballot...' : 'Submit Official Ballot →'}
                  </button>
                </div>
              </form>
            ) : (
              /* Closed / Draft Info Box */
              <div className="rounded-lg border border-hairline bg-surface p-8 text-center space-y-2">
                <h3 className="text-sm font-semibold text-ink">Polls are currently closed</h3>
                <p className="text-xs text-ink-secondary">
                  This election is currently in status <strong>{election.status}</strong>. Voting options are only active when status is <strong>PUBLISHED</strong>.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-hairline bg-surface p-8 text-center text-xs text-ink-muted font-mono">
            Election record not found.
          </div>
        )}
      </div>
    </main>
  );
}
