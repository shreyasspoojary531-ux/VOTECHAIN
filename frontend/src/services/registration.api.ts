import { apiClient } from './api';
import type {
  AadhaarSearchQuery,
  AadhaarSearchResult,
  Paginated,
  RegisterVoterRequest,
  RegisterVoterResponse,
  Voter,
} from '@/types';

export interface RegistrarSummary {
  votersRegisteredToday: number;
  pendingVerifications: number;
  totalRegistered: number;
}

/**
 * GET /api/v1/registrar/aadhaar/search
 */
export async function searchAadhaar(query: AadhaarSearchQuery): Promise<AadhaarSearchResult[]> {
  const searchParams = new URLSearchParams();
  if (query.aadhaarNumber) {
    searchParams.set('aadhaarNumber', query.aadhaarNumber);
  }
  const queryString = searchParams.toString();
  const path = `/registrar/aadhaar/search${queryString ? `?${queryString}` : ''}`;

  return apiClient<AadhaarSearchResult[]>(path, {
    method: 'GET',
  });
}

/**
 * POST /api/v1/registrar/register-voter
 */
export async function registerVoter(data: RegisterVoterRequest): Promise<RegisterVoterResponse> {
  return apiClient<RegisterVoterResponse>('/registrar/register-voter', {
    method: 'POST',
    body: data,
  });
}

/**
 * GET /api/v1/registrar/voters
 */
export async function listRegisteredVoters(
  page = 1,
  pageSize = 10,
  search = '',
): Promise<Paginated<Voter>> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) {
    params.set('search', search);
  }
  const result = await apiClient<Paginated<Voter> | Voter[]>(
    `/registrar/voters?${params.toString()}`,
    {
      method: 'GET',
    },
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
    items?: Voter[];
    data?: Voter[];
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
 * GET /api/v1/registrar/summary
 */
export async function getRegistrarSummary(): Promise<RegistrarSummary> {
  return apiClient<RegistrarSummary>('/registrar/summary', {
    method: 'GET',
  });
}
