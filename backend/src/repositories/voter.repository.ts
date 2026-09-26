import { prisma } from "../utils/prisma";

export const findProfileByUserId = (userId: string) =>
  prisma.voterProfile.findUnique({ where: { userId }, include: { aadhaar: true } });

export const findProfileByAadhaarId = (aadhaarId: string) =>
  prisma.voterProfile.findUnique({ where: { aadhaarId } });

export const listVoters = (filters: { constituency?: string }) =>
  prisma.voterProfile.findMany({
    where: filters.constituency ? { constituency: filters.constituency } : {},
    include: { user: { select: { id: true, email: true, status: true, role: true } }, aadhaar: { select: { fullName: true, constituency: true } } },
    take: 100,
  });

export const createEligibility = (data: { voterProfileId: string; electionId: string }) =>
  prisma.voterEligibility.upsert({
    where: { voterProfileId_electionId: { voterProfileId: data.voterProfileId, electionId: data.electionId } },
    update: { eligible: true },
    create: { ...data, eligible: true },
  });

export const findEligibility = (voterProfileId: string, electionId: string) =>
  prisma.voterEligibility.findUnique({ where: { voterProfileId_electionId: { voterProfileId, electionId } } });

export const listEligibleVoters = (electionId: string) =>
  prisma.voterEligibility.findMany({
    where: { electionId },
    include: { voterProfile: { include: { user: { select: { email: true, status: true } } } } },
  });
