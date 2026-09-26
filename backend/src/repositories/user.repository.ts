import { Prisma } from '@prisma/client';

import { prisma } from '../utils/prisma';

/** Fields safe to expose about any authenticated user (never passwordHash). */
export const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const satisfies Prisma.UserSelect;

export type PublicUser = {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
};

export const userRepository = {
  async findByEmail(email: string): Promise<{
    id: string;
    email: string;
    passwordHash: string;
    role: string;
    isActive: boolean;
  } | null> {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
      },
    });
  },

  async findById(id: string): Promise<PublicUser | null> {
    return prisma.user.findUnique({ where: { id }, select: PUBLIC_USER_SELECT });
  },
};
