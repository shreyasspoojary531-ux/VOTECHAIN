import { prisma } from '../utils/prisma';

export interface CreateCandidateInput {
  electionId: string;
  name: string;
  party: string;
  symbolUrl?: string | null;
}

export interface UpdateCandidateInput {
  name?: string;
  party?: string;
  symbolUrl?: string | null;
}

export const candidateRepository = {
  async findById(id: string) {
    return prisma.candidate.findUnique({
      where: { id },
      include: { election: true },
    });
  },

  async findByElection(electionId: string) {
    return prisma.candidate.findMany({
      where: { electionId },
      orderBy: { createdAt: 'asc' },
    });
  },

  async create(input: CreateCandidateInput) {
    return prisma.candidate.create({
      data: {
        electionId: input.electionId,
        name: input.name,
        party: input.party,
        symbolUrl: input.symbolUrl ?? null,
      },
    });
  },

  async update(id: string, input: UpdateCandidateInput) {
    return prisma.candidate.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.party && { party: input.party }),
        ...(input.symbolUrl !== undefined && { symbolUrl: input.symbolUrl }),
      },
    });
  },

  async delete(id: string) {
    return prisma.candidate.delete({
      where: { id },
    });
  },
};
