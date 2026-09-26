import { z } from 'zod';

const ISO_DATETIME = z
  .string()
  .datetime({ offset: true, message: 'Must be an ISO 8601 date-time' })
  .or(z.string().min(10, 'Must be a valid date'));

export const listElectionsQuerySchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'RESULTS_PUBLISHED']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export const createElectionBodySchema = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000),
    startsAt: ISO_DATETIME,
    endsAt: ISO_DATETIME,
    candidates: z
      .array(
        z.object({
          name: z.string().trim().min(2, 'Candidate name must be at least 2 characters').max(120),
          partyName: z.string().trim().min(2, 'Party name must be at least 2 characters').max(120),
          imageUrl: z.string().url().optional().nullable(),
        })
      )
      .min(2, 'At least 2 candidates are required'),
  })
  .refine((b) => new Date(b.endsAt) > new Date(b.startsAt), {
    message: 'endsAt must be after startsAt',
    path: ['endsAt'],
  });

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid election id'),
});

export type ListElectionsQuery = z.infer<typeof listElectionsQuerySchema>;
export type CreateElectionBody = z.infer<typeof createElectionBodySchema>;
