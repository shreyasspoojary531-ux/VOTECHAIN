import crypto from 'crypto';
import { prisma } from '../utils/prisma';

export const credentialRepository = {
  async getOrCreateCredential(voterProfileId: string, electionId: string) {
    // 1. Ensure eligibility record exists
    let eligibility = await prisma.voterEligibility.findUnique({
      where: {
        voterProfileId_electionId: { voterProfileId, electionId },
      },
      include: { credential: true },
    });

    if (!eligibility) {
      eligibility = await prisma.voterEligibility.create({
        data: {
          voterProfileId,
          electionId,
          isEligible: true,
        },
        include: { credential: true },
      });
    }

    if (eligibility.credential) {
      return eligibility.credential;
    }

    // Generate unique cryptographic anonymous credential hash
    const credentialHash = 'cred_' + crypto.randomBytes(24).toString('hex');

    return prisma.anonymousCredential.create({
      data: {
        credentialHash,
        electionId,
        voterEligibilityId: eligibility.id,
        isUsed: false,
      },
    });
  },

  async findByCredentialHash(credentialHash: string) {
    return prisma.anonymousCredential.findUnique({
      where: { credentialHash },
      include: { election: true },
    });
  },

  async findByUserAndElection(userId: string, electionId: string) {
    const voterProfile = await prisma.voterProfile.findUnique({
      where: { userId },
    });
    if (!voterProfile) return null;

    const eligibility = await prisma.voterEligibility.findUnique({
      where: {
        voterProfileId_electionId: {
          voterProfileId: voterProfile.id,
          electionId,
        },
      },
      include: { credential: true },
    });

    return eligibility?.credential || null;
  },
};
