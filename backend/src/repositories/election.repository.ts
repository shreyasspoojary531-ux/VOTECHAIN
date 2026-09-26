import { prisma } from "../utils/prisma";

export const createElection = (data: {
  title: string;
  description?: string;
  constituency: string;
  startAt: Date;
  endAt: Date;
  createdBy: string;
}) => prisma.election.create({ data });

export const findElectionById = (id: string) =>
  prisma.election.findUnique({ where: { id }, include: { candidates: true } });

export const listElections = (filters: { status?: string; constituency?: string }) =>
  prisma.election.findMany({
    where: {
      ...(filters.status ? { status: filters.status as never } : {}),
      ...(filters.constituency ? { constituency: filters.constituency } : {}),
    },
    include: { candidates: { select: { id: true, name: true, party: true } } },
    orderBy: { createdAt: "desc" },
  });

export const updateElectionStatus = (id: string, status: "DRAFT" | "PUBLISHED" | "ACTIVE" | "CLOSED" | "RESULTS") =>
  prisma.election.update({ where: { id }, data: { status } });

export const updateElection = (
  id: string,
  data: { title?: string; description?: string; constituency?: string; startAt?: Date; endAt?: Date },
) => prisma.election.update({ where: { id }, data });

export const createCandidate = (data: {
  electionId: string;
  name: string;
  party: string;
  symbol?: string;
  manifesto?: string;
}) => prisma.candidate.create({ data });

export const findCandidateById = (id: string) => prisma.candidate.findUnique({ where: { id } });

export const updateCandidate = (
  id: string,
  data: { name?: string; party?: string; symbol?: string; manifesto?: string },
) => prisma.candidate.update({ where: { id }, data });

export const deleteCandidate = (id: string) => prisma.candidate.delete({ where: { id } });

export const listCandidates = (electionId: string) =>
  prisma.candidate.findMany({ where: { electionId }, orderBy: { createdAt: "asc" } });

export const countCandidates = (electionId: string) =>
  prisma.candidate.count({ where: { electionId } });
