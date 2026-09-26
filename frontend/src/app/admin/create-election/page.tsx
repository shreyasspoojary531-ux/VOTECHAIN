'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createElection } from '@/services/election.api';
import { ApiError } from '@/services/api';

interface CandidateInput {
  name: string;
  partyName: string;
}

export default function CreateElectionPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startsAtDate, setStartsAtDate] = useState('');
  const [endsAtDate, setEndsAtDate] = useState('');

  const [candidates, setCandidates] = useState<CandidateInput[]>([
    { name: '', partyName: '' },
    { name: '', partyName: '' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddCandidate = () => {
    setCandidates([...candidates, { name: '', partyName: '' }]);
  };

  const handleRemoveCandidate = (index: number) => {
    if (candidates.length <= 1) return;
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const handleCandidateChange = (index: number, field: keyof CandidateInput, value: string) => {
    const updated = [...candidates];
    updated[index][field] = value;
    setCandidates(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Election title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Election description is required.');
      return;
    }
    if (!startsAtDate || !endsAtDate) {
      setError('Both start and end dates are required.');
      return;
    }

    const startsAt = new Date(startsAtDate).getTime();
    const endsAt = new Date(endsAtDate).getTime();

    if (endsAt <= startsAt) {
      setError('Poll end date must be after the start date.');
      return;
    }

    const validCandidates = candidates.filter(
      (c) => c.name.trim() !== '' && c.partyName.trim() !== '',
    );

    if (validCandidates.length < 1) {
      setError('At least one candidate with name and party must be added.');
      return;
    }

    setLoading(true);

    try {
      await createElection({
        title,
        description,
        startsAt,
        endsAt,
        candidates: validCandidates,
      });

      router.push('/admin/elections');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        // Redirect to elections table upon creation completion
        router.push('/admin/elections');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-canvas p-6 text-ink md:p-12">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <Link
            href="/admin/dashboard"
            className="font-mono text-xs text-ink-muted hover:text-ink hover:underline"
          >
            ← Back to Console
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Create New Election</h1>
          <p className="text-sm text-ink-secondary">
            Configure election metadata, voting timeline, and official candidate roster.
          </p>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-lg border border-hairline bg-surface p-6"
        >
          {error && (
            <div
              role="alert"
              className="rounded-md border border-danger/30 bg-danger/10 p-3 text-xs text-danger"
            >
              {error}
            </div>
          )}

          <div className="space-y-4 border-b border-hairline pb-6">
            <h2 className="text-xs font-medium uppercase tracking-wider text-ink-secondary">
              Election Details
            </h2>

            <div className="space-y-1.5">
              <label htmlFor="title" className="text-xs font-medium text-ink-secondary">
                Election Title
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="2026 Parliamentary Election"
                className="w-full rounded-md border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-xs font-medium text-ink-secondary">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of the election scope..."
                className="w-full rounded-md border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                disabled={loading}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="startsAt" className="text-xs font-medium text-ink-secondary">
                  Poll Start Date & Time
                </label>
                <input
                  id="startsAt"
                  type="datetime-local"
                  required
                  value={startsAtDate}
                  onChange={(e) => setStartsAtDate(e.target.value)}
                  className="w-full rounded-md border border-hairline-strong bg-canvas px-3 py-2 font-mono text-xs text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="endsAt" className="text-xs font-medium text-ink-secondary">
                  Poll Close Date & Time
                </label>
                <input
                  id="endsAt"
                  type="datetime-local"
                  required
                  value={endsAtDate}
                  onChange={(e) => setEndsAtDate(e.target.value)}
                  className="w-full rounded-md border border-hairline-strong bg-canvas px-3 py-2 font-mono text-xs text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Candidate List Setup */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium uppercase tracking-wider text-ink-secondary">
                Candidate Roster
              </h2>
              <button
                type="button"
                onClick={handleAddCandidate}
                className="text-xs font-medium text-accent hover:underline"
              >
                + Add Candidate
              </button>
            </div>

            <div className="space-y-3">
              {candidates.map((cand, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-3 rounded-md border border-hairline bg-canvas p-3 sm:flex-row sm:items-center"
                >
                  <span className="font-mono text-xs text-ink-muted shrink-0">#{idx + 1}</span>
                  <input
                    type="text"
                    placeholder="Candidate Name"
                    value={cand.name}
                    onChange={(e) => handleCandidateChange(idx, 'name', e.target.value)}
                    className="flex-1 rounded border border-hairline-strong bg-surface px-3 py-1.5 text-xs text-ink placeholder-ink-muted focus:border-accent focus:outline-none"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="Party Affiliation"
                    value={cand.partyName}
                    onChange={(e) => handleCandidateChange(idx, 'partyName', e.target.value)}
                    className="flex-1 rounded border border-hairline-strong bg-surface px-3 py-1.5 text-xs text-ink placeholder-ink-muted focus:border-accent focus:outline-none"
                    disabled={loading}
                  />
                  {candidates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCandidate(idx)}
                      className="text-xs text-danger hover:underline shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-ink py-2.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Creating Election...' : 'Publish Election'}
          </button>
        </form>
      </div>
    </main>
  );
}
