import { z } from 'zod';

export const auditElectionParamSchema = z.object({
  id: z.string().uuid('Invalid electionId'),
});
