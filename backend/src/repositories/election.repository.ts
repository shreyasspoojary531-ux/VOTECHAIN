import { Prisma } from '@prisma/client';

import { prisma } from '../utils/prisma';

/** Public election projection — candidates included, creator reduced to nothing sensitive. */
const ELECTION_SELECT = {
  id: true,
  title: true,
  description: true,
  status: true,
  startDate: true,
  endDate: true,
  createdAt: true,
  candidates: {
    select: { id: true, name: true, party: true, symbolUrl: true },
    orderBy: { createdAt: 'asc' as const },
  },
  _count: { select: { ballots: true } },
} as const satisfies Prisma.ElectionSelect;

export type ElectionWithCandidates = {
  id: string;
  title: string;
  description: string;
  status: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  candidates: Array<{ id: string; name: string; party: string; symbolUrl: string | null }>;
  totalVotes: number;
};

export interface CreateElectionInput {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  createdByUserId: string;
  candidates: Array<{ name: string; party: string; symbolUrl?: string | null }>;
}

export const electionRepository = {
  /** Paginated list, newest first, optional status filter. */
  async list(
    status: string | undefined,
    page: number,
    pageSize: number
  ): Promise<{ data: ElectionWithCandidates[]; total: number; page: number; pageSize: number }> {
    const where: Prisma.ElectionWhereInput = status ? { status: status as never } : {};

    const [total, rows] = await Promise.all([
      prisma.election.count({ where }),
      prisma.election.findMany({
        where,
        select: ELECTION_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data: rows.map(mapToElection),
      total,
      page,
      pageSize,
    };
  },

  async findById(id: string): Promise<ElectionWithCandidates | null> {
    const row = await prisma.election.findUnique({ where: { id }, select: ELECTION_SELECT });
    return row ? mapToElection(row) : null;
  },

  /** Creates the election and its candidate roster in one transaction. */
  async create(input: CreateElectionInput): Promise<ElectionWithCandidates> {
    const row = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.election.create({
        data: {
          title: input.title,
          description: input.description,
          status: 'DRAFT',
          startDate: input.startDate,
          endDate: input.endDate,
          createdByUserId: input.createdByUserId,
          candidates: {
            create: input.candidates.map((c) => ({
              name: c.name,
              party: c.party,
              symbolUrl: c.symbolUrl ?? null,
            })),
          },
        },
        select: ELECTION_SELECT,
      });
    });
    return mapToElection(row);
  },

  /** Per-candidate vote totals for a closed/published election. */
  async results(electionId: string): Promise<{
    election: { id: string; title: string; status: string };
    totalVotes: number;
    results: Array<{ candidateId: string; candidateName: string; partyName: string; voteCount: number }>;
  } | null> {
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      select: {
        id: true,
        title: true,
        status: true,
        candidates: {
          select: {
            id: true,
            name: true,
            party: true,
            _count: { select: { ballots: true } },
          },
        },
      },
    });
    if (!election) return null;

    const results = election.candidates.map((c) => ({
      candidateId: c.id,
      candidateName: c.name,
      partyName: c.party,
      voteCount: c._count.ballots,
    }));
    const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);

    return {
      election: { id: election.id, title: election.title, status: election.status },
      totalVotes,
      results,
    };
  },

  /** Admin dashboard counters. */
  async adminSummary(): Promise<{
    activeElectionsCount: number;
    totalElectionsCount: number;
    totalVotesCast: number;
  }> {
    const [activeElectionsCount, totalElectionsCount, totalVotesCast] = await Promise.all([
      prisma.election.count({ where: { status: 'PUBLISHED' } }),
      prisma.election.count(),
      prisma.ballot.count(),
    ]);
    return { activeElectionsCount, totalElectionsCount, totalVotesCast };
  },
};

/** Normalize Prisma row into the public shape (dates as ISO, votes count). */
function mapToElection(row: {
  id: string;
  title: string;
  description: string;
  status: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  candidates: Array<{ id: string; name: string; party: string; symbolUrl: string | null }>;
  _count: { ballots: number };
}): ElectionWithCandidates {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    startDate: row.startDate,
    endDate: row.endDate,
    createdAt: row.createdAt,
    candidates: row.candidates,
    totalVotes: row._count.ballots,
  };
}
