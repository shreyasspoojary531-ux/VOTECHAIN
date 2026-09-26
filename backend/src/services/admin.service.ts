import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { fabricService } from '../blockchain/fabric.service';

export interface CreateMockAadhaarInput {
  aadhaarNumber: string;
  fullName: string;
  dateOfBirth: Date;
  gender: string;
  phone: string;
  address: string;
}

export const adminService = {
  /** Create a new Mock Aadhaar citizen record */
  async createMockAadhaar(input: CreateMockAadhaarInput) {
    const existing = await prisma.mockAadhaar.findUnique({
      where: { aadhaarNumber: input.aadhaarNumber },
    });

    if (existing) {
      throw new AppError(
        'A citizen with this Aadhaar number already exists',
        409,
        true,
        'AADHAAR_EXISTS'
      );
    }

    return prisma.mockAadhaar.create({
      data: {
        aadhaarNumber: input.aadhaarNumber,
        fullName: input.fullName,
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        phone: input.phone,
        address: input.address,
      },
    });
  },

  /** Paginated list of Mock Aadhaar records */
  async listMockAadhaars(page = 1, pageSize = 20, search = '') {
    const skip = (page - 1) * pageSize;
    const where = search.trim()
      ? {
          OR: [
            { aadhaarNumber: { contains: search.trim() } },
            { fullName: { contains: search.trim(), mode: 'insensitive' as const } },
            { address: { contains: search.trim(), mode: 'insensitive' as const } },
            { phone: { contains: search.trim() } },
          ],
        }
      : {};

    const [total, data] = await Promise.all([
      prisma.mockAadhaar.count({ where }),
      prisma.mockAadhaar.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  /** Delete a Mock Aadhaar citizen record */
  async deleteMockAadhaar(id: string) {
    const record = await prisma.mockAadhaar.findUnique({ where: { id } });
    if (!record) {
      throw new AppError('Mock Aadhaar record not found', 404, true, 'RECORD_NOT_FOUND');
    }

    // Check if linked to a VoterProfile
    const linkedProfile = await prisma.voterProfile.findUnique({ where: { aadhaarId: id } });
    if (linkedProfile) {
      // Find eligibilities to clear credentials
      const eligibilities = await prisma.voterEligibility.findMany({
        where: { voterProfileId: linkedProfile.id },
        select: { id: true },
      });
      const eligibilityIds = eligibilities.map((e) => e.id);

      await prisma.$transaction([
        prisma.anonymousCredential.deleteMany({ where: { voterEligibilityId: { in: eligibilityIds } } }),
        prisma.voterEligibility.deleteMany({ where: { voterProfileId: linkedProfile.id } }),
        prisma.oTPCode.deleteMany({ where: { userId: linkedProfile.userId } }),
        prisma.voterProfile.delete({ where: { id: linkedProfile.id } }),
        prisma.user.delete({ where: { id: linkedProfile.userId } }),
        prisma.mockAadhaar.delete({ where: { id } }),
      ]);
      return { deleted: true, cascadeVoter: true };
    }

    await prisma.mockAadhaar.delete({ where: { id } });
    return { deleted: true, cascadeVoter: false };
  },

  /** Delete an Election and its related candidates, eligibility, and ballots */
  async deleteElection(id: string) {
    const election = await prisma.election.findUnique({ where: { id } });
    if (!election) {
      throw new AppError('Election not found', 404, true, 'ELECTION_NOT_FOUND');
    }

    const eligibilities = await prisma.voterEligibility.findMany({
      where: { electionId: id },
      select: { id: true },
    });
    const eligibilityIds = eligibilities.map((e) => e.id);

    await prisma.$transaction([
      prisma.auditRecord.deleteMany({ where: { electionId: id } }),
      prisma.blockchainTransaction.deleteMany({ where: { electionId: id } }),
      prisma.ballot.deleteMany({ where: { electionId: id } }),
      prisma.anonymousCredential.deleteMany({ where: { voterEligibilityId: { in: eligibilityIds } } }),
      prisma.voterEligibility.deleteMany({ where: { electionId: id } }),
      prisma.candidate.deleteMany({ where: { electionId: id } }),
      prisma.election.delete({ where: { id } }),
    ]);

    return { deleted: true };
  },

  /** Delete a registered voter (User & VoterProfile) */
  async deleteVoter(id: string) {
    const profile = await prisma.voterProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] },
    });

    if (!profile) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new AppError('Voter not found', 404, true, 'VOTER_NOT_FOUND');
      }
      await prisma.user.delete({ where: { id: user.id } });
      return { deleted: true };
    }

    const eligibilities = await prisma.voterEligibility.findMany({
      where: { voterProfileId: profile.id },
      select: { id: true },
    });
    const eligibilityIds = eligibilities.map((e) => e.id);

    await prisma.$transaction([
      prisma.oTPCode.deleteMany({ where: { userId: profile.userId } }),
      prisma.anonymousCredential.deleteMany({ where: { voterEligibilityId: { in: eligibilityIds } } }),
      prisma.voterEligibility.deleteMany({ where: { voterProfileId: profile.id } }),
      prisma.voterProfile.delete({ where: { id: profile.id } }),
      prisma.user.delete({ where: { id: profile.userId } }),
    ]);

    return { deleted: true };
  },

  /** Reset / Clear Blockchain Ledger (deletes all transactions, ballots, and resets Fabric Gateway to Genesis) */
  async resetBlockchain() {
    await prisma.$transaction([
      prisma.ballot.deleteMany({}),
      prisma.blockchainTransaction.deleteMany({}),
      prisma.anonymousCredential.updateMany({
        data: { isUsed: false, usedAt: null },
      }),
      prisma.auditRecord.deleteMany({
        where: {
          eventType: {
            in: [
              'BALLOT_CREATED',
              'BALLOT_HASHED',
              'BLOCKCHAIN_SUBMITTED',
              'BLOCKCHAIN_CONFIRMED',
              'CREDENTIAL_USED',
            ],
          },
        },
      }),
    ]);

    fabricService.reset();

    return { success: true, message: 'Blockchain ledger successfully reset to Genesis block' };
  },
};
