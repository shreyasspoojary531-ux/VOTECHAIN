import { apiClient } from './api';
import type { ElectionAuditReport } from '@/types';

/**
 * GET /api/v1/audit/elections/:id
 * Fetches the aggregate audit report for a single election.
 */
export async function getElectionAudit(electionId: string): Promise<ElectionAuditReport> {
  return apiClient<ElectionAuditReport>(`/audit/elections/${encodeURIComponent(electionId)}`, {
    method: 'GET',
  });
}
