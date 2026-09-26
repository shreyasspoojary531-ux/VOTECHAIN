import { z } from "zod";

export const aadhaarSearchSchema = z.object({
  query: z.object({
    q: z.string().min(2).optional(),
    constituency: z.string().optional(),
  }),
});

export const registerVoterSchema = z.object({
  body: z.object({
    aadhaarId: z.string().uuid(),
    email: z.string().email(),
    // Temporary password the voter changes later; min 8 like auth.
    password: z.string().min(8),
  }),
});

export type AadhaarSearchQuery = z.infer<typeof aadhaarSearchSchema>["query"];
export type RegisterVoterBody = z.infer<typeof registerVoterSchema>["body"];
