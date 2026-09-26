import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import { AppError } from '../middleware/errorHandler';
import { aadhaarRepository, AadhaarIdentity } from '../repositories/aadhaar.repository';
import { voterRepository, RegisteredVoter } from '../repositories/voter.repository';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

const MINIMUM_VOTER_AGE = 18;

export interface RegisterVoterResult {
  voterProfileId: string;
  userId: string;
  email: string;
  /** One-time temporary password, shown once to the registrar. Demo simplification. */
  temporaryPassword: string;
}

export const registrarService = {
  /** Search Mock Aadhaar for registration candidates (exact number or partial name). */
  async searchAadhaar(query: { aadhaarNumber?: string; fullName?: string }): Promise<
    AadhaarIdentity[]
  > {
    return aadhaarRepository.searchByNameOrNumber(query);
  },

  /**
   * Register an adult citizen as a voter.
   * - 404 when the Aadhaar number is unknown
   * - 400 when the citizen is under 18 (no records created)
   * - 409 when a VoterProfile already exists (no new records)
   * - otherwise creates User + VoterProfile atomically and logs VOTER_REGISTERED audit
   */
  async registerVoter(
    aadhaarNumber: string,
    registrarUserId: string
  ): Promise<RegisterVoterResult> {
    const aadhaar = await prisma.mockAadhaar.findUnique({ where: { aadhaarNumber } });
    if (!aadhaar) {
      throw new AppError('No citizen found with this Aadhaar number', 404, true, 'AADHAAR_NOT_FOUND');
    }

    // Age check BEFORE creating anything
    const age = computeAge(aadhaar.dateOfBirth);
    if (age < MINIMUM_VOTER_AGE) {
      throw new AppError(
        `Voter must be 18 or older (citizen is ${age})`,
        400,
        true,
        'UNDERAGE_VOTER'
      );
    }

    const existingProfile = await prisma.voterProfile.findUnique({ where: { aadhaarId: aadhaar.id } });
    if (existingProfile) {
      throw new AppError('Voter is already registered', 409, true, 'ALREADY_REGISTERED');
    }

    // Generate unique email + one-time temporary password (demo credential delivery)
    const email = await generateUniqueVoterEmail(aadhaar.fullName, aadhaarNumber);
    const temporaryPassword = crypto.randomBytes(9).toString('base64url'); // ~12 chars
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const { user, voterProfile } = await voterRepository.createVoterWithProfileTx(tx, {
        email,
        passwordHash,
        aadhaarId: aadhaar.id,
        registeredByUserId: registrarUserId,
      });

      await tx.auditRecord.create({
        data: {
          eventType: 'VOTER_REGISTERED',
          actorUserId: registrarUserId,
          metadata: {
            voterProfileId: voterProfile.id,
            voterUserId: user.id,
            // Never log the Aadhaar number itself — log only a masked reference
            aadhaarRef: `...${aadhaarNumber.slice(-4)}`,
          },
        },
      });

      return { user, voterProfile };
    });

    logger.info(
      { voterProfileId: result.voterProfile.id, registrarUserId },
      'Voter registered'
    );

    return {
      voterProfileId: result.voterProfile.id,
      userId: result.user.id,
      email: result.user.email,
      temporaryPassword,
    };
  },

  /** Paginated registered-voter list. */
  async listVoters(page: number, pageSize: number): Promise<Paginated<RegisteredVoter>> {
    return voterRepository.listVoters(page, pageSize);
  },

  /** Single registered voter by VoterProfile id (restricted field set). */
  async getVoterById(id: string): Promise<RegisteredVoter | null> {
    return voterRepository.getVoterById(id);
  },
};

/** Compute full years from a birth date. */
function computeAge(dateOfBirth: Date): number {
  const now = new Date();
  let age = now.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - dateOfBirth.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < dateOfBirth.getUTCDate())) {
    age -= 1;
  }
  return age;
}

/** firstname.lastname.XXXX@votechain.demo, guaranteed unique; digits from Aadhaar tail. */
async function generateUniqueVoterEmail(fullName: string, aadhaarNumber: string): Promise<string> {
  const slug = fullName
    .toLowerCase()
    .replace(/[^a-z ]/g, '')
    .trim()
    .replace(/\s+/g, '.');
  const tail = aadhaarNumber.slice(-4);
  const base = `${slug}.${tail}@votechain.demo`;

  const existing = await prisma.user.findUnique({ where: { email: base } });
  if (!existing) return base;

  // Extremely unlikely fallback: append random suffix
  return `${slug}.${tail}.${crypto.randomBytes(2).toString('hex')}@votechain.demo`;
}

/** Local pagination envelope type (kept inline to avoid a circular types import). */
export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}


