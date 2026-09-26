import { AppError } from '../middleware/errorHandler';
import {
  electionRepository,
  ElectionWithCandidates,
} from '../repositories/election.repository';
import { candidateRepository } from '../repositories/candidate.repository';
import { prisma } from '../utils/prisma';

export interface FrontendCandidate {
  id: string;
  name: string;
  partyName: string;
  imageUrl: string | null;
}

export interface FrontendElection {
  id: string;
  title: string;
  description: string;
  status: string;
  startsAt: number;
  endsAt: number;
  candidates: FrontendCandidate[];
}

export const electionService = {
  async list(
    status: string | undefined,
    page: number,
    pageSize: number
  ): Promise<{ items: FrontendElection[]; total: number; page: number; pageSize: number }> {
    const result = await electionRepository.list(status, page, pageSize);
    return {
      items: result.data.map(toFrontend),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  },

  async getById(id: string): Promise<FrontendElection> {
    const election = await electionRepository.findById(id);
    if (!election) {
      throw new AppError('Election not found', 404, true, 'ELECTION_NOT_FOUND');
    }
    return toFrontend(election);
  },

  /** ADMIN only */
  async create(
    input: {
      title: string;
      description: string;
      startsAt: Date;
      endsAt: Date;
      candidates: Array<{ name: string; partyName: string; imageUrl?: string | null }>;
    },
    adminUserId: string
  ): Promise<FrontendElection> {
    if (input.endsAt <= input.startsAt) {
      throw new AppError('End date must be after start date', 422, true, 'VALIDATION_ERROR');
    }

    const election = await electionRepository.create({
      title: input.title,
      description: input.description,
      startDate: input.startsAt,
      endDate: input.endsAt,
      createdByUserId: adminUserId,
      candidates: input.candidates.map((c) => ({
        name: c.name,
        party: c.partyName,
        symbolUrl: c.imageUrl ?? null,
      })),
    });

    return toFrontend(election);
  },

  /** ADMIN only: Edit election details */
  async update(
    id: string,
    input: {
      title?: string;
      description?: string;
      startsAt?: Date;
      endsAt?: Date;
    }
  ): Promise<FrontendElection> {
    const existing = await electionRepository.findById(id);
    if (!existing) {
      throw new AppError('Election not found', 404, true, 'ELECTION_NOT_FOUND');
    }

    if (existing.status !== 'DRAFT') {
      throw new AppError('Cannot edit an election after it has been published', 400, true, 'ELECTION_NOT_EDITABLE');
    }

    const updated = await prisma.election.update({
      where: { id },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.description && { description: input.description }),
        ...(input.startsAt && { startDate: input.startsAt }),
        ...(input.endsAt && { endDate: input.endsAt }),
      },
      include: {
        candidates: { select: { id: true, name: true, party: true, symbolUrl: true } },
        _count: { select: { ballots: true } },
      },
    });

    return toFrontend({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      status: updated.status,
      startDate: updated.startDate,
      endDate: updated.endDate,
      createdAt: updated.createdAt,
      candidates: updated.candidates,
      totalVotes: updated._count.ballots,
    });
  },

  /** ADMIN only: Transition to PUBLISHED */
  async publish(id: string): Promise<FrontendElection> {
    const existing = await electionRepository.findById(id);
    if (!existing) {
      throw new AppError('Election not found', 404, true, 'ELECTION_NOT_FOUND');
    }

    if (existing.candidates.length === 0) {
      throw new AppError('Cannot publish an election with zero candidates', 400, true, 'NO_CANDIDATES');
    }

    const updated = await prisma.election.update({
      where: { id },
      data: { status: 'PUBLISHED' },
      include: {
        candidates: { select: { id: true, name: true, party: true, symbolUrl: true } },
        _count: { select: { ballots: true } },
      },
    });

    await prisma.auditRecord.create({
      data: {
        eventType: 'ELECTION_PUBLISHED',
        electionId: id,
      },
    });

    return toFrontend({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      status: updated.status,
      startDate: updated.startDate,
      endDate: updated.endDate,
      createdAt: updated.createdAt,
      candidates: updated.candidates,
      totalVotes: updated._count.ballots,
    });
  },

  /** ADMIN only: Transition to CLOSED */
  async close(id: string): Promise<FrontendElection> {
    const existing = await electionRepository.findById(id);
    if (!existing) {
      throw new AppError('Election not found', 404, true, 'ELECTION_NOT_FOUND');
    }

    const updated = await prisma.election.update({
      where: { id },
      data: { status: 'CLOSED' },
      include: {
        candidates: { select: { id: true, name: true, party: true, symbolUrl: true } },
        _count: { select: { ballots: true } },
      },
    });

    await prisma.auditRecord.create({
      data: {
        eventType: 'ELECTION_CLOSED',
        electionId: id,
      },
    });

    return toFrontend({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      status: updated.status,
      startDate: updated.startDate,
      endDate: updated.endDate,
      createdAt: updated.createdAt,
      candidates: updated.candidates,
      totalVotes: updated._count.ballots,
    });
  },

  /** ADMIN only: Transition to RESULTS_PUBLISHED */
  async publishResults(id: string): Promise<FrontendElection> {
    const existing = await electionRepository.findById(id);
    if (!existing) {
      throw new AppError('Election not found', 404, true, 'ELECTION_NOT_FOUND');
    }

    const updated = await prisma.election.update({
      where: { id },
      data: { status: 'RESULTS_PUBLISHED' },
      include: {
        candidates: { select: { id: true, name: true, party: true, symbolUrl: true } },
        _count: { select: { ballots: true } },
      },
    });

    await prisma.auditRecord.create({
      data: {
        eventType: 'RESULTS_PUBLISHED',
        electionId: id,
      },
    });

    return toFrontend({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      status: updated.status,
      startDate: updated.startDate,
      endDate: updated.endDate,
      createdAt: updated.createdAt,
      candidates: updated.candidates,
      totalVotes: updated._count.ballots,
    });
  },

  /** Public results view with percentages */
  async results(electionId: string) {
    const data = await electionRepository.results(electionId);
    if (!data) {
      throw new AppError('Election not found', 404, true, 'ELECTION_NOT_FOUND');
    }

    const { election, totalVotes, results } = data;
    return {
      electionId: election.id,
      title: election.title,
      totalVotesCast: totalVotes,
      status: election.status,
      results: results.map((r) => ({
        ...r,
        votePercentage: totalVotes === 0 ? 0 : Math.round((r.voteCount / totalVotes) * 1000) / 10,
      })),
    };
  },

  async adminSummary() {
    return electionRepository.adminSummary();
  },

  // Candidate management
  async getCandidates(electionId: string) {
    return candidateRepository.findByElection(electionId);
  },

  async addCandidate(electionId: string, input: { name: string; party: string; symbolUrl?: string | null }) {
    const election = await electionRepository.findById(electionId);
    if (!election) throw new AppError('Election not found', 404, true, 'ELECTION_NOT_FOUND');
    if (election.status !== 'DRAFT') throw new AppError('Cannot add candidates after publishing', 400, true, 'NOT_DRAFT');
    return candidateRepository.create({ electionId, ...input });
  },

  async updateCandidate(id: string, input: { name?: string; party?: string; symbolUrl?: string | null }) {
    const candidate = await candidateRepository.findById(id);
    if (!candidate) throw new AppError('Candidate not found', 404, true, 'CANDIDATE_NOT_FOUND');
    return candidateRepository.update(id, input);
  },

  async deleteCandidate(id: string) {
    const candidate = await candidateRepository.findById(id);
    if (!candidate) throw new AppError('Candidate not found', 404, true, 'CANDIDATE_NOT_FOUND');
    return candidateRepository.delete(id);
  },
};

function toFrontend(e: ElectionWithCandidates): FrontendElection {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    status: e.status,
    startsAt: e.startDate.getTime(),
    endsAt: e.endDate.getTime(),
    candidates: e.candidates.map((c) => ({
      id: c.id,
      name: c.name,
      partyName: c.party,
      imageUrl: c.symbolUrl,
    })),
  };
}
