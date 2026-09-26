import { prisma } from "../utils/prisma";
import type { Role } from "@prisma/client";

export const createUser = (data: { email: string; passwordHash: string; role?: Role }) =>
  prisma.user.create({
    data: { email: data.email, passwordHash: data.passwordHash, role: data.role ?? "VOTER" },
  });

export const findByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email }, include: { voterProfile: true } });

export const findById = (id: string) =>
  prisma.user.findUnique({ where: { id } });

/** Activate account (status INACTIVE → ACTIVE) after REGISTRATION OTP. */
export const activateUser = (id: string) =>
  prisma.user.update({ where: { id }, data: { status: "ACTIVE" } });

export const createVoterWithProfile = (data: {
  email: string;
  passwordHash: string;
  aadhaarId: string;
  constituency: string;
}) =>
  prisma.user.create({
    data: {
      email: data.email,
      passwordHash: data.passwordHash,
      role: "VOTER",
      status: "ACTIVE",
      voterProfile: {
        create: {
          aadhaarId: data.aadhaarId,
          constituency: data.constituency,
          isVerified: true,
        },
      },
    },
    include: { voterProfile: true },
  });
