'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getElections } from '@/services/election.api';
import { listRegisteredVoters } from '@/services/registration.api';
import {
  deleteElection,
  deleteMockAadhaar,
  deleteVoter,
  listMockAadhaars,
} from '@/services/admin.api';
import { ApiError } from '@/services/api';
import type { Election, MockAadhaarRecord, Voter } from '@/types';

export default function AdminDataControlPage() {
  const [activeTab, setActiveTab] = useState<'elections' | 'voters' | 'aadhaar'>('elections');

  // Lists Data
  const [elections, setElections] = useState<Election[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [aadhaars, setAadhaars] = useState<MockAadhaarRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [electionsRes, votersRes, aadhaarRes] = await Promise.all([
        getElections().catch(() => []),
        listRegisteredVoters(1, 50).catch(() => ({ items: [], data: [] })),
        listMockAadhaars(1, 50).catch(() => ({ items: [], data: [] })),
      ]);

      setElections(Array.isArray(electionsRes) ? electionsRes : []);
      setVoters(votersRes.items || votersRes.data || []);
      setAadhaars(aadhaarRes.items || aadhaarRes.data || []);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch testing control data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleDeleteElection = async (id: string, title: string) => {
    if (!confirm(`Delete election "${title}"? This will clear all linked ballots and candidates.`)) return;

    setDeletingId(id);
    setError(null);
    setSuccessMsg(null);
    try {
      await deleteElection(id);
      setSuccessMsg(`Successfully deleted election "${title}"`);
      fetchAllData();
    } catch (err: unknown) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to delete election');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteVoter = async (id: string, name: string) => {
    if (!confirm(`Delete registered voter "${name}"? This removes their login account and voter profile.`)) return;

    setDeletingId(id);
    setError(null);
    setSuccessMsg(null);
    try {
      await deleteVoter(id);
      setSuccessMsg(`Successfully deleted voter "${name}"`);
      fetchAllData();
    } catch (err: unknown) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to delete voter profile');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAadhaar = async (id: string, aadhaarNum: string) => {
    if (!confirm(`Delete Mock Aadhaar citizen #${aadhaarNum}?`)) return;

    setDeletingId(id);
    setError(null);
    setSuccessMsg(null);
    try {
      await deleteMockAadhaar(id);
      setSuccessMsg(`Successfully deleted citizen record #${aadhaarNum}`);
      fetchAllData();
    } catch (err: unknown) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to delete Aadhaar record');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-canvas p-6 text-ink md:p-12">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <Link
              href="/admin/dashboard"
              className="font-mono text-xs text-ink-muted hover:text-ink hover:underline"
            >
              ← Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight">Testing & Data Control Hub</h1>
            <p className="text-xs text-ink-secondary">
              Centralized administrative control panel to manage, add, and delete entities for seamless site testing.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/mock-aadhaar"
              className="rounded-md border border-hairline bg-surface px-4 py-2 text-xs font-medium text-ink hover:bg-surface-raised"
            >
              🪪 Mock Aadhaar Directory
            </Link>
            <Link
              href="/admin/create-election"
              className="rounded-md bg-ink px-4 py-2 text-xs font-medium text-canvas hover:opacity-90"
            >
              + Create Election
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="rounded-md border border-danger/30 bg-danger/10 p-4 text-xs text-danger"
          >
            {error}
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="rounded-md border border-success/30 bg-success/10 p-4 text-xs text-success"
          >
            {successMsg}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-hairline text-sm font-medium">
          <button
            onClick={() => setActiveTab('elections')}
            className={`px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'elections'
                ? 'border-ink text-ink font-semibold'
                : 'border-transparent text-ink-secondary hover:text-ink'
            }`}
          >
            🗳️ Elections ({elections.length})
          </button>
          <button
            onClick={() => setActiveTab('voters')}
            className={`px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'voters'
                ? 'border-ink text-ink font-semibold'
                : 'border-transparent text-ink-secondary hover:text-ink'
            }`}
          >
            👥 Registered Voters ({voters.length})
          </button>
          <button
            onClick={() => setActiveTab('aadhaar')}
            className={`px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'aadhaar'
                ? 'border-ink text-ink font-semibold'
                : 'border-transparent text-ink-secondary hover:text-ink'
            }`}
          >
            🪪 Mock Aadhaar Citizens ({aadhaars.length})
          </button>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg border border-hairline bg-surface"
              ></div>
            ))}
          </div>
        ) : (
          <div>
            {/* TAB 1: ELECTIONS */}
            {activeTab === 'elections' && (
              <div className="space-y-4">
                {elections.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-hairline bg-canvas text-xs uppercase tracking-wider text-ink-secondary">
                        <tr>
                          <th className="px-4 py-3 font-medium">Title</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Candidates</th>
                          <th className="px-4 py-3 font-medium">Voting Schedule</th>
                          <th className="px-4 py-3 text-right font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hairline">
                        {elections.map((item) => (
                          <tr key={item.id} className="hover:bg-surface-raised">
                            <td className="px-4 py-3 font-semibold text-ink">{item.title}</td>
                            <td className="px-4 py-3 font-mono text-xs text-ink-secondary">
                              <span className="px-2 py-0.5 rounded bg-surface border border-hairline">
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-ink-secondary">
                              {item.candidates?.length || 0} candidates
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                              {new Date(item.startsAt).toLocaleDateString()} →{' '}
                              {new Date(item.endsAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                disabled={deletingId === item.id}
                                onClick={() => handleDeleteElection(item.id, item.title)}
                                className="rounded border border-danger/40 bg-danger/10 px-3 py-1 text-xs text-danger hover:bg-danger/20 disabled:opacity-50 font-mono"
                              >
                                {deletingId === item.id ? 'Deleting...' : '🗑️ Delete Election'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-hairline bg-surface p-12 text-center text-xs text-ink-muted font-mono">
                    No elections created yet. Use the Create Election button above to add one.
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: VOTERS */}
            {activeTab === 'voters' && (
              <div className="space-y-4">
                {voters.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-hairline bg-canvas text-xs uppercase tracking-wider text-ink-secondary">
                        <tr>
                          <th className="px-4 py-3 font-medium">Voter ID</th>
                          <th className="px-4 py-3 font-medium">Name</th>
                          <th className="px-4 py-3 font-medium">Aadhaar Tail</th>
                          <th className="px-4 py-3 font-medium">Constituency</th>
                          <th className="px-4 py-3 text-right font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hairline font-mono text-xs">
                        {voters.map((item) => (
                          <tr key={item.id} className="hover:bg-surface-raised">
                            <td className="px-4 py-3 text-ink font-bold">{item.id}</td>
                            <td className="px-4 py-3 font-sans text-ink">{item.name}</td>
                            <td className="px-4 py-3 text-ink-secondary">•••• {item.aadhaarLast4}</td>
                            <td className="px-4 py-3 text-ink-secondary">{item.constituencyId}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                disabled={deletingId === item.id}
                                onClick={() => handleDeleteVoter(item.id, item.name)}
                                className="rounded border border-danger/40 bg-danger/10 px-3 py-1 text-xs text-danger hover:bg-danger/20 disabled:opacity-50"
                              >
                                {deletingId === item.id ? 'Deleting...' : '🗑️ Delete Voter'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-hairline bg-surface p-12 text-center text-xs text-ink-muted font-mono">
                    No registered voters in system.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MOCK AADHAAR */}
            {activeTab === 'aadhaar' && (
              <div className="space-y-4">
                {aadhaars.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-hairline bg-canvas text-xs uppercase tracking-wider text-ink-secondary">
                        <tr>
                          <th className="px-4 py-3 font-medium">Aadhaar Number</th>
                          <th className="px-4 py-3 font-medium">Full Name</th>
                          <th className="px-4 py-3 font-medium">Gender / DOB</th>
                          <th className="px-4 py-3 font-medium">Address</th>
                          <th className="px-4 py-3 text-right font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hairline font-mono text-xs">
                        {aadhaars.map((item) => (
                          <tr key={item.id} className="hover:bg-surface-raised">
                            <td className="px-4 py-3 font-bold text-ink">{item.aadhaarNumber}</td>
                            <td className="px-4 py-3 font-sans text-ink font-medium">{item.fullName}</td>
                            <td className="px-4 py-3 text-ink-secondary">
                              {item.gender} • {new Date(item.dateOfBirth).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-ink-muted max-w-xs truncate">{item.address}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                disabled={deletingId === item.id}
                                onClick={() => handleDeleteAadhaar(item.id, item.aadhaarNumber)}
                                className="rounded border border-danger/40 bg-danger/10 px-3 py-1 text-xs text-danger hover:bg-danger/20 disabled:opacity-50"
                              >
                                {deletingId === item.id ? 'Deleting...' : '🗑️ Delete Citizen'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-hairline bg-surface p-12 text-center text-xs text-ink-muted font-mono">
                    No Mock Aadhaar records found.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
