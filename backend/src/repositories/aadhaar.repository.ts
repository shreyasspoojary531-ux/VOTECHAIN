import { Prisma } from '@prisma/client';

import { prisma } from '../utils/prisma';

/**
 * Minimal identity fields a registrar needs to confirm a person's identity in person.
 * Deliberately excludes the full address and other PII not required for registration.
 */
export const IDENTITY_SELECT = {
  id: true,
  aadhaarNumber: true,
  fullName: true,
  dateOfBirth: true,
  gender: true,
  phone: true,
} as const satisfies Prisma.MockAadhaarSelect;

export type AadhaarIdentity = {
  id: string;
  aadhaarNumber: string;
  fullName: string;
  dateOfBirth: Date;
  gender: string;
  phone: string;
  alreadyRegistered: boolean;
};

export const aadhaarRepository = {
  /** Exact match by 12-digit Aadhaar number (with registration flag). Returns null if not found. */
  async findByAadhaarNumber(aadhaarNumber: string): Promise<AadhaarIdentity | null> {
    const record = await prisma.mockAadhaar.findUnique({
      where: { aadhaarNumber },
      select: IDENTITY_SELECT,
    });
    if (!record) return null;
    return { ...record, alreadyRegistered: false };
  },

  /**
   * Search by exact aadhaarNumber OR partial (case-insensitive) fullName.
   * Attaches alreadyRegistered flag based on whether a VoterProfile links the record.
   */
  async searchByNameOrNumber(query: {
    aadhaarNumber?: string;
    fullName?: string;
  }): Promise<AadhaarIdentity[]> {
    const where: Prisma.MockAadhaarWhereInput = query.aadhaarNumber
      ? { aadhaarNumber: query.aadhaarNumber }
      : { fullName: { contains: query.fullName!, mode: 'insensitive' } };

    const records = await prisma.mockAadhaar.findMany({
      where,
      select: { ...IDENTITY_SELECT, voterProfile: { select: { id: true } } },
      orderBy: { fullName: 'asc' },
      take: 50,
    });

    return records.map(({ voterProfile, ...record }) => ({
      ...record,
      alreadyRegistered: Boolean(voterProfile),
    }));
  },

  /** True when a VoterProfile already exists for the given MockAadhaar id. */
  async hasVoterProfile(aadhaarId: string): Promise<boolean> {
    const profile = await prisma.voterProfile.findUnique({ where: { aadhaarId } });
    return Boolean(profile);
  },
};
