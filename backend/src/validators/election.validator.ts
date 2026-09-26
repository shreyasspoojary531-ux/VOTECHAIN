import { z } from 'zod';

const FLEXIBLE_DATETIME = z.union([
  z.number(),
  z.string().min(1, 'Date is required'),
  z.date(),
]);

export const listElectionsQuerySchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'RESULTS_PUBLISHED']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export const createElectionBodySchema = z
  .object({
    title: z.string().trim().min(1, 'Title must be at least 1 character').max(200),
    description: z.string().trim().min(1, 'Description must be at least 1 character').max(2000),
    startsAt: FLEXIBLE_DATETIME,
    endsAt: FLEXIBLE_DATETIME,
    candidates: z
      .array(
        z.object({
          name: z.string().trim().min(1, 'Candidate name must be at least 1 character').max(120),
          partyName: z.string().trim().min(1, 'Party name must be at least 1 character').max(120),
          imageUrl: z.string().url().optional().nullable().or(z.literal('')),
        })
      )
      .min(1, 'At least 1 candidate is required'),
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
