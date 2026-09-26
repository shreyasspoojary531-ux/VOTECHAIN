import { z } from 'zod';

export const credentialBodySchema = z.object({
  electionId: z.string().uuid('Invalid electionId'),
});

export const castVoteBodySchema = z.object({
  electionId: z.string().uuid('Invalid electionId'),
  candidateId: z.string().uuid('Invalid candidateId'),
  credentialHash: z.string().min(10, 'Invalid credentialHash'),
  encryptedPayload: z.string().optional(),
});

export const voteStatusQuerySchema = z.object({
  electionId: z.string().uuid('Invalid electionId'),
});

export const receiptParamSchema = z.object({
  txId: z.string().min(5, 'Invalid txId'),
});

export type CredentialBody = z.infer<typeof credentialBodySchema>;
export type CastVoteBody = z.infer<typeof castVoteBodySchema>;
