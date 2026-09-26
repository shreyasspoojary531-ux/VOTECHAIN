import { prisma } from "../utils/prisma";

export type OTPPurpose = "LOGIN" | "REGISTRATION";

export const createOtp = (data: { userId: string; purpose: OTPPurpose; codeHash: string; expiresAt: Date }) =>
  prisma.oTPCode.create({ data });

/** Latest unconsumed, unexpired OTP for a user+purpose. */
export const findLatestValid = (userId: string, purpose: OTPPurpose) =>
  prisma.oTPCode.findFirst({
    where: { userId, purpose, isUsed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

export const markConsumed = (id: string) =>
  prisma.oTPCode.update({ where: { id }, data: { isUsed: true } });

/** Invalidate any prior unconsumed OTPs for this user+purpose. */
export const invalidatePrior = (userId: string, purpose: OTPPurpose) =>
  prisma.oTPCode.updateMany({
    where: { userId, purpose, isUsed: false },
    data: { isUsed: true },
  });
