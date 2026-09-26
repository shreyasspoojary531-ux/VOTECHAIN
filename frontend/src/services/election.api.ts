import { apiClient } from './api';
import type { CreateElectionRequest, Election, ElectionStatus, Paginated } from '@/types';

export interface ListElectionsParams {
  status?: ElectionStatus;
  page?: number;
  pageSize?: number;
}

/**
 * GET /api/v1/elections
 */
export async function getElections(): Promise<Election[]> {
  const result = await apiClient<Election[] | Paginated<Election>>('/elections', {
    method: 'GET',
  });
  if (Array.isArray(result)) {
    return result;
  }
  return result?.items || [];
}

/**
 * GET /api/v1/elections (paginated helper)
 */
export async function listElections(params?: ListElectionsParams): Promise<Paginated<Election>> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  if (params?.pageSize) query.set('pageSize', String(params.pageSize));

  const path = `/elections${query.toString() ? `?${query.toString()}` : ''}`;
  const result = await apiClient<Paginated<Election> | Election[]>(path, { method: 'GET' });

  if (Array.isArray(result)) {
    return {
      items: result,
      total: result.length,
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
    };
  }
  return result;
}

/**
 * GET /api/v1/elections/:id
 */
export async function getElectionById(id: string): Promise<Election> {
  return apiClient<Election>(`/elections/${id}`, {
    method: 'GET',
  });
}

/**
 * POST /api/v1/elections
 */
export async function createElection(data: CreateElectionRequest): Promise<Election> {
  return apiClient<Election>('/elections', {
    method: 'POST',
    body: data,
  });
}
