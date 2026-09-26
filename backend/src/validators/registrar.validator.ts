import { z } from 'zod';

/**
 * GET /registrar/aadhaar/search query params.
 * Supports exact aadhaarNumber (12 digits) OR partial fullName match.
 * At least one must be provided.
 */
export const aadhaarSearchQuerySchema = z
  .object({
    aadhaarNumber: z
      .string()
      .regex(/^\d{12}$/, 'aadhaarNumber must be exactly 12 digits')
      .optional(),
    fullName: z.string().trim().min(2, 'fullName must be at least 2 characters').optional(),
  })
  .refine((q) => q.aadhaarNumber || q.fullName, {
    message: 'Provide aadhaarNumber or fullName to search',
  });

/** POST /registrar/register-voter body. */
export const registerVoterBodySchema = z.object({
  aadhaarNumber: z.string().regex(/^\d{12}$/, 'aadhaarNumber must be exactly 12 digits'),
});

export type AadhaarSearchQuery = z.infer<typeof aadhaarSearchQuerySchema>;
export type RegisterVoterBody = z.infer<typeof registerVoterBodySchema>;
