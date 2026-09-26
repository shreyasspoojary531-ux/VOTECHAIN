import { apiClient } from './api';
import type { CreateMockAadhaarRequest, MockAadhaarRecord, Paginated } from '@/types';

/**
 * GET /api/v1/admin/mock-aadhaar
 */
export async function listMockAadhaars(
  page = 1,
  pageSize = 20,
  search = ''
): Promise<Paginated<MockAadhaarRecord>> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) params.set('search', search);

  const result = await apiClient<Paginated<MockAadhaarRecord> | MockAadhaarRecord[]>(
    `/admin/mock-aadhaar?${params.toString()}`,
    { method: 'GET' }
  );

  if (Array.isArray(result)) {
    return {
      items: result,
      data: result,
      total: result.length,
      page,
      pageSize,
    };
  }

  const raw = result as unknown as {
    items?: MockAadhaarRecord[];
    data?: MockAadhaarRecord[];
    total?: number;
    page?: number;
    pageSize?: number;
  };
  const list = raw?.items || raw?.data || [];

  return {
    items: list,
    data: list,
    total: raw?.total ?? list.length,
    page: raw?.page ?? page,
    pageSize: raw?.pageSize ?? pageSize,
  };
}

/**
 * POST /api/v1/admin/mock-aadhaar
 */
export async function createMockAadhaar(
  data: CreateMockAadhaarRequest
): Promise<MockAadhaarRecord> {
  return apiClient<MockAadhaarRecord>('/admin/mock-aadhaar', {
    method: 'POST',
    body: data,
  });
}

/**
 * DELETE /api/v1/admin/mock-aadhaar/:id
 */
export async function deleteMockAadhaar(
  id: string
): Promise<{ deleted: boolean; cascadeVoter?: boolean }> {
  return apiClient<{ deleted: boolean; cascadeVoter?: boolean }>(`/admin/mock-aadhaar/${id}`, {
    method: 'DELETE',
  });
}

/**
 * DELETE /api/v1/admin/elections/:id
 */
export async function deleteElection(id: string): Promise<{ deleted: boolean }> {
  return apiClient<{ deleted: boolean }>(`/admin/elections/${id}`, {
    method: 'DELETE',
  });
}

/**
 * DELETE /api/v1/admin/voters/:id
 */
export async function deleteVoter(id: string): Promise<{ deleted: boolean }> {
  return apiClient<{ deleted: boolean }>(`/admin/voters/${id}`, {
    method: 'DELETE',
  });
}

/**
 * POST /api/v1/admin/blockchain/reset — Reset Blockchain Ledger to Genesis block
 */
export async function resetBlockchainLedger(): Promise<{ success: boolean; message?: string }> {
  return apiClient<{ success: boolean; message?: string }>('/admin/blockchain/reset', {
    method: 'POST',
  });
}
