import { apiClient } from './api';
import type {
  Candidate,
  CreateElectionRequest,
  Election,
  ElectionStatus,
  Paginated,
} from '@/types';

export interface ListElectionsParams {
  status?: ElectionStatus;
  page?: number;
  pageSize?: number;
}

export interface CandidateResult {
  candidateId: string;
  candidateName: string;
  partyName: string;
  voteCount: number;
  votePercentage: number;
}

export interface ElectionResultsData {
  electionId: string;
  title: string;
  totalVotesCast: number;
  status: ElectionStatus;
  results: CandidateResult[];
}

export interface AdminSummary {
  activeElectionsCount: number;
  totalVotesCast: number;
  totalElectionsCount: number;
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
  const raw = result as unknown as { items?: Election[]; data?: Election[] };
  return raw?.items || raw?.data || [];
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

/**
 * GET /api/v1/elections/:id/results
 * TODO: backend endpoint not yet specified in API contract v1 for election results
 */
export async function getElectionResults(electionId: string): Promise<ElectionResultsData> {
  return apiClient<ElectionResultsData>(`/elections/${electionId}/results`, {
    method: 'GET',
  });
}

/**
 * PUT /api/v1/elections/:id/candidates
 * TODO: backend endpoint not yet specified in API contract v1 for candidate CRUD
 */
export async function updateElectionCandidates(
  electionId: string,
  candidates: Array<Pick<Candidate, 'name' | 'partyName'>>,
): Promise<Election> {
  return apiClient<Election>(`/elections/${electionId}/candidates`, {
    method: 'PUT',
    body: { candidates },
  });
}

/**
 * GET /api/v1/admin/summary
 */
export async function getAdminSummary(): Promise<AdminSummary> {
  return apiClient<AdminSummary>('/admin/summary', {
    method: 'GET',
  });
}
