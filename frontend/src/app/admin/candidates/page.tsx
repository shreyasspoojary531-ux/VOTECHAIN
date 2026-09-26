'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getElections, updateElectionCandidates } from '@/services/election.api';
import { ApiError } from '@/services/api';
import type { Candidate, Election } from '@/types';

export default function AdminCandidatesPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  const [loadingElections, setLoadingElections] = useState(true);

  const [newName, setNewName] = useState('');
  const [newParty, setNewParty] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchElections = async () => {
      setLoadingElections(true);
      try {
        const list = await getElections();
        setElections(list);
        if (list.length > 0) {
          setSelectedElectionId(list[0].id);
        }
      } catch {
        // Fallback demo elections list
        const demoList: Election[] = [
          {
            id: 'elec_2026_general',
            title: '2026 National Parliamentary Election',
            description: 'General election for parliamentary representatives.',
            status: 'ACTIVE',
            startsAt: Date.now(),
            endsAt: Date.now() + 86400000,
            candidates: [
              { id: 'cand_1', name: 'Dr. Aris Thorne', partyName: 'Progressive Liberty Party' },
              { id: 'cand_2', name: 'Elena Vance', partyName: 'Alliance for Innovation' },
            ],
          },
        ];
        setElections(demoList);
        setSelectedElectionId(demoList[0].id);
      } finally {
        setLoadingElections(false);
      }
    };

    fetchElections();
  }, []);

  const selectedElection = elections.find((e) => e.id === selectedElectionId);

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newParty.trim() || !selectedElectionId) return;

    setError(null);
    setUpdating(true);

    try {
      const existingCandidates = selectedElection?.candidates || [];
      const updatedList: Array<Pick<Candidate, 'name' | 'partyName'>> = [
        ...existingCandidates.map((c) => ({ name: c.name, partyName: c.partyName })),
        { name: newName.trim(), partyName: newParty.trim() },
      ];

      /**
       * TODO: backend endpoint not yet specified in API contract v1 for candidate CRUD.
       * Calls updateElectionCandidates stub in services/election.api.ts.
       */
      await updateElectionCandidates(selectedElectionId, updatedList);

      // Local optimistic state update
      const newCandObj: Candidate = {
        id: `cand_${Date.now()}`,
        name: newName.trim(),
        partyName: newParty.trim(),
      };

      setElections((prev) =>
        prev.map((el) =>
          el.id === selectedElectionId ? { ...el, candidates: [...el.candidates, newCandObj] } : el,
        ),
      );

      setNewName('');
      setNewParty('');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        // Optimistic UI fallback
        const newCandObj: Candidate = {
          id: `cand_${Date.now()}`,
          name: newName.trim(),
          partyName: newParty.trim(),
        };
        setElections((prev) =>
          prev.map((el) =>
            el.id === selectedElectionId
              ? { ...el, candidates: [...el.candidates, newCandObj] }
              : el,
          ),
        );
        setNewName('');
        setNewParty('');
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <main className="min-h-screen bg-canvas p-6 text-ink md:p-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <Link
            href="/admin/dashboard"
            className="font-mono text-xs text-ink-muted hover:text-ink hover:underline"
          >
            ← Back to Console
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Manage Candidates</h1>
          <p className="text-sm text-ink-secondary">
            Select an election to view or append candidate details.
          </p>
        </div>

        {/* Election Selector */}
        <div className="space-y-2 rounded-lg border border-hairline bg-surface p-6">
          <label htmlFor="electionSelect" className="text-xs font-medium text-ink-secondary">
            Select Election
          </label>
          <select
            id="electionSelect"
            value={selectedElectionId}
            onChange={(e) => setSelectedElectionId(e.target.value)}
            disabled={loadingElections}
            className="w-full rounded-md border border-hairline-strong bg-canvas px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {elections.map((elec) => (
              <option key={elec.id} value={elec.id}>
                {elec.title} ({elec.status})
              </option>
            ))}
          </select>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="rounded-md border border-danger/30 bg-danger/10 p-3 text-xs text-danger"
          >
            {error}
          </div>
        )}

        {/* Selected Election Candidates List */}
        {selectedElection && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xs font-medium uppercase tracking-wider text-ink-secondary">
                Registered Candidates ({selectedElection.candidates.length})
              </h2>

              {selectedElection.candidates.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-hairline bg-canvas text-xs uppercase tracking-wider text-ink-secondary">
                      <tr>
                        <th className="px-4 py-3 font-medium">Candidate ID</th>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Party Affiliation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {selectedElection.candidates.map((cand) => (
                        <tr key={cand.id} className="hover:bg-surface-raised">
                          <td className="px-4 py-3 font-mono text-xs text-ink-muted">{cand.id}</td>
                          <td className="px-4 py-3 font-medium text-ink">{cand.name}</td>
                          <td className="px-4 py-3 text-ink-secondary">{cand.partyName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-hairline bg-surface p-8 text-center text-xs text-ink-muted font-mono">
                  No candidates registered for this election.
                </div>
              )}
            </div>

            {/* Add Candidate Form */}
            <form
              onSubmit={handleAddCandidate}
              className="space-y-4 rounded-lg border border-hairline bg-surface p-6"
            >
              <h3 className="text-xs font-medium uppercase tracking-wider text-ink-secondary">
                Add Candidate to {selectedElection.title}
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  required
                  placeholder="Candidate Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-md border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink placeholder-ink-muted focus:border-accent focus:outline-none"
                  disabled={updating}
                />
                <input
                  type="text"
                  required
                  placeholder="Party Name"
                  value={newParty}
                  onChange={(e) => setNewParty(e.target.value)}
                  className="rounded-md border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink placeholder-ink-muted focus:border-accent focus:outline-none"
                  disabled={updating}
                />
              </div>

              <button
                type="submit"
                disabled={updating || !newName.trim() || !newParty.trim()}
                className="rounded-md bg-ink px-4 py-2 text-xs font-medium text-canvas hover:opacity-90 disabled:opacity-50"
              >
                {updating ? 'Saving Candidate...' : 'Add Candidate'}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
