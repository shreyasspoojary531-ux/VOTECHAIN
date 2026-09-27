'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  createMockAadhaar,
  deleteMockAadhaar,
  listMockAadhaars,
} from '@/services/admin.api';
import { ApiError } from '@/services/api';
import type { CreateMockAadhaarRequest, MockAadhaarRecord, Paginated } from '@/types';

export default function AdminMockAadhaarPage() {
  const [data, setData] = useState<Paginated<MockAadhaarRecord> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateMockAadhaarRequest>({
    aadhaarNumber: '',
    fullName: '',
    dateOfBirth: '1995-01-01',
    gender: 'Male',
    phone: '',
    address: '',
  });

  const fetchRecords = async (currentPage: number, query: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await listMockAadhaars(currentPage, 15, query);
      setData(res);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch Mock Aadhaar records');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(page, search);
  }, [page, search]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12) {
      setError('Aadhaar number must be exactly 12 digits');
      return;
    }
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError('Valid mobile phone number is required');
      return;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }

    setSubmitting(true);
    try {
      await createMockAadhaar(formData);
      setSuccessMsg(`Successfully created Mock Aadhaar citizen #${formData.aadhaarNumber}`);
      setIsModalOpen(false);
      setFormData({
        aadhaarNumber: '',
        fullName: '',
        dateOfBirth: '1995-01-01',
        gender: 'Male',
        phone: '',
        address: '',
      });
      fetchRecords(1, search);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create Mock Aadhaar record');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, aadhaarNum: string) => {
    if (!confirm(`Are you sure you want to delete citizen #${aadhaarNum}? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    setError(null);
    setSuccessMsg(null);

    try {
      await deleteMockAadhaar(id);
      setSuccessMsg(`Deleted citizen record #${aadhaarNum}`);
      fetchRecords(page, search);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to delete record');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const recordsList = data?.items || data?.data || [];

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
            <h1 className="text-3xl font-semibold tracking-tight">Mock Aadhaar Citizen Directory</h1>
            <p className="text-xs text-ink-secondary">
              Manage test citizens in the simulated Aadhaar database for voter enrolment testing.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/data-control"
              className="rounded-md border border-hairline bg-surface px-4 py-2 text-xs font-medium text-ink hover:bg-surface-raised"
            >
              ⚙️ Testing Control Hub
            </Link>
            <button
              onClick={() => {
                setError(null);
                setIsModalOpen(true);
              }}
              className="rounded-md bg-ink px-4 py-2 text-xs font-medium text-canvas hover:opacity-90"
            >
              + Create New Citizen Entry
            </button>
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

        {/* Search Bar */}
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Aadhaar number, name, or city..."
            className="w-full max-w-md rounded-md border border-hairline-strong bg-surface px-4 py-2 text-sm text-ink placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Table List Container */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg border border-hairline bg-surface"
              ></div>
            ))}
          </div>
        ) : recordsList.length > 0 && data ? (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-hairline bg-canvas text-xs uppercase tracking-wider text-ink-secondary">
                  <tr>
                    <th className="px-4 py-3 font-medium">Aadhaar Number</th>
                    <th className="px-4 py-3 font-medium">Full Name</th>
                    <th className="px-4 py-3 font-medium">Gender / DOB</th>
                    <th className="px-4 py-3 font-medium">Phone Number</th>
                    <th className="px-4 py-3 font-medium">Address</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline font-mono text-xs">
                  {recordsList.map((citizen) => (
                    <tr key={citizen.id} className="hover:bg-surface-raised">
                      <td className="px-4 py-3 font-bold text-ink">{citizen.aadhaarNumber}</td>
                      <td className="px-4 py-3 font-sans text-ink font-medium">{citizen.fullName}</td>
                      <td className="px-4 py-3 text-ink-secondary">
                        {citizen.gender} • {new Date(citizen.dateOfBirth).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-ink-secondary">{citizen.phone}</td>
                      <td className="px-4 py-3 text-ink-muted max-w-xs truncate" title={citizen.address}>
                        {citizen.address}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          disabled={deletingId === citizen.id}
                          onClick={() => handleDelete(citizen.id, citizen.aadhaarNumber)}
                          className="rounded border border-danger/40 bg-danger/10 px-3 py-1 text-xs text-danger hover:bg-danger/20 disabled:opacity-50"
                        >
                          {deletingId === citizen.id ? 'Deleting...' : '🗑️ Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between text-xs text-ink-secondary">
              <span className="font-mono">
                Page {data.page} of {Math.max(1, Math.ceil(data.total / data.pageSize))} ({data.total} total citizens)
              </span>

              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="rounded border border-hairline bg-surface px-3 py-1.5 font-mono text-ink hover:bg-surface-raised disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page * data.pageSize >= data.total}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="rounded border border-hairline bg-surface px-3 py-1.5 font-mono text-ink hover:bg-surface-raised disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-hairline bg-surface p-12 text-center space-y-3">
            <p className="font-mono text-sm font-semibold text-ink">No citizen records found</p>
            <p className="text-xs text-ink-secondary max-w-sm mx-auto">
              Create a new Mock Aadhaar entry to test voter enrolment workflows.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-block rounded-md bg-ink px-4 py-2 text-xs font-medium text-canvas hover:opacity-90"
            >
              + Create First Citizen
            </button>
          </div>
        )}

        {/* Modal Dialog for New Citizen */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl border border-hairline bg-canvas p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <h2 className="text-lg font-semibold tracking-tight text-ink">
                  Add New Mock Aadhaar Citizen
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-ink-muted hover:text-ink text-sm font-mono"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-ink-secondary font-medium mb-1">
                    12-Digit Aadhaar Number *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/\D/g, '') })}
                    placeholder="e.g. 999988887777"
                    className="w-full rounded border border-hairline bg-surface p-2.5 font-mono text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-ink-secondary font-medium mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full rounded border border-hairline bg-surface p-2.5 text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-ink-secondary font-medium mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full rounded border border-hairline bg-surface p-2.5 text-ink focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-ink-secondary font-medium mb-1">
                      Gender *
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
                      className="w-full rounded border border-hairline bg-surface p-2.5 text-ink focus:border-accent focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-ink-secondary font-medium mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded border border-hairline bg-surface p-2.5 font-mono text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-ink-secondary font-medium mb-1">
                    Residential Address *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. #101 Lotus Tower, MG Road, Bengaluru, KA"
                    className="w-full rounded border border-hairline bg-surface p-2.5 text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded border border-hairline px-4 py-2 font-medium text-ink-secondary hover:bg-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded bg-ink px-4 py-2 font-medium text-canvas hover:opacity-90 disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Save Citizen Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
