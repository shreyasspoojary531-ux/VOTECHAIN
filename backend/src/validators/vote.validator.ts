import { z } from "zod";

export const requestCredentialSchema = z.object({
  body: z.object({
    electionId: z.string().uuid(),
  }),
});

export const castVoteSchema = z.object({
  body: z.object({
    credential: z.string().uuid(),
    candidateId: z.string().uuid(),
  }),
});

export type RequestCredentialBody = z.infer<typeof requestCredentialSchema>["body"];
export type CastVoteBody = z.infer<typeof castVoteSchema>["body"];
