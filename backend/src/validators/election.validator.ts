import { z } from "zod";

export const createElectionSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    constituency: z.string().min(1),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
  }).refine((b) => b.endAt > b.startAt, { message: "endAt must be after startAt" }),
});

export const updateElectionSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    constituency: z.string().optional(),
    startAt: z.coerce.date().optional(),
    endAt: z.coerce.date().optional(),
  }),
});

export const listElectionsSchema = z.object({
  query: z.object({
    status: z.enum(["DRAFT", "PUBLISHED", "ACTIVE", "CLOSED", "RESULTS"]).optional(),
    constituency: z.string().optional(),
  }),
});

export const createCandidateSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    party: z.string().min(2),
    symbol: z.string().optional(),
    manifesto: z.string().optional(),
  }),
});

export const updateCandidateSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    party: z.string().min(2).optional(),
    symbol: z.string().optional(),
    manifesto: z.string().optional(),
  }),
});

export type CreateElectionBody = z.infer<typeof createElectionSchema>["body"];
export type UpdateElectionBody = z.infer<typeof updateElectionSchema>["body"];
export type CreateCandidateBody = z.infer<typeof createCandidateSchema>["body"];
export type UpdateCandidateBody = z.infer<typeof updateCandidateSchema>["body"];
