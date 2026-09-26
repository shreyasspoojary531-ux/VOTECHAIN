import { Prisma } from '@prisma/client';

import { prisma } from '../utils/prisma';

/**
 * Fields returned when listing registered voters — deliberately excludes the
 * full Aadhaar record (only fullName) per the registrar module privacy spec.
 */
const VOTER_LIST_SELECT = {
  id: true,
  createdAt: true,
  user: { select: { email: true, isActive: true } },
  aadhaar: { select: { fullName: true } },
} as const satisfies Prisma.VoterProfileSelect;

export type RegisteredVoter = {
  id: string;
  email: string;
  isActive: boolean;
  fullName: string;
  registeredAt: Date; // mapped from schema's createdAt
};

export interface PaginatedVoters {
  data: RegisteredVoter[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CreateVoterTxInput {
  email: string;
  passwordHash: string;
  aadhaarId: string;
  registeredByUserId: string;
}

export const voterRepository = {
  /**
   * Creates User (role VOTER, active immediately) + VoterProfile in ONE transaction.
   * Throws Prisma P2002 on unique-constraint violation (email or aadhaarId).
   */
  async createVoterWithProfileTx(tx: Prisma.TransactionClient, input: CreateVoterTxInput) {
    const user = await tx.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        role: 'VOTER',
        isActive: true,
      },
    });

    const voterProfile = await tx.voterProfile.create({
      data: {
        userId: user.id,
        aadhaarId: input.aadhaarId,
        registeredByUserId: input.registeredByUserId,
      },
    });

    return { user, voterProfile };
  },

  /** Paginated registered-voter list joined with User email/isActive and Aadhaar fullName only. */
  async listVoters(page: number, pageSize: number): Promise<PaginatedVoters> {
    const [total, rows] = await Promise.all([
      prisma.voterProfile.count(),
      prisma.voterProfile.findMany({
        select: VOTER_LIST_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data: rows.map(({ user, aadhaar, ...rest }) => ({
        ...rest,
        email: user.email,
        isActive: user.isActive,
        fullName: aadhaar.fullName,
        registeredAt: rest.createdAt,
      })),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  /** Fetch a single registered voter with the same restricted field set. */
  async getVoterById(id: string): Promise<RegisteredVoter | null> {
    const row = await prisma.voterProfile.findUnique({
      where: { id },
      select: VOTER_LIST_SELECT,
    });
    if (!row) return null;
    const { user, aadhaar, ...rest } = row;
    return {
      ...rest,
      email: user.email,
      isActive: user.isActive,
      fullName: aadhaar.fullName,
      registeredAt: rest.createdAt,
    };
  },
};
