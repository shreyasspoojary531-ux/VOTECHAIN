import { OTPPurpose, Prisma } from '@prisma/client';

import { prisma } from '../utils/prisma';

export const otpRepository = {
  /** Store a new hashed OTP. Invalidates (deletes) any previous unconsumed codes for the user+purpose. */
  async create(userId: string, otpHash: string, purpose: OTPPurpose, expiresAt: Date) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Only one live OTP per user+purpose: wipe old unconsumed ones
      await tx.oTPCode.deleteMany({
        where: { userId, purpose, consumedAt: null },
      });
      return tx.oTPCode.create({
        data: { userId, codeHash: otpHash, purpose, expiresAt },
      });
    });
  },

  /** Latest unconsumed, unexpired OTP for a user+purpose (null if none). */
  async findLatestValid(userId: string, purpose: OTPPurpose) {
    return prisma.oTPCode.findFirst({
      where: {
        userId,
        purpose,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /** Mark an OTP as consumed (single-use enforcement). Returns true when a row was updated. */
  async consume(id: string): Promise<boolean> {
    const result = await prisma.oTPCode.updateMany({
      where: { id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    return result.count === 1;
  },

  /** Count OTPs a user has requested within the trailing window (for rate limiting). */
  async countRecentRequests(userId: string, since: Date): Promise<number> {
    return prisma.oTPCode.count({
      where: { userId, createdAt: { gte: since } },
    });
  },
};
