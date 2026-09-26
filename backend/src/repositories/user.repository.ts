import { prisma } from "../utils/prisma";

export const createUser = (data: { email: string; passwordHash: string; role?: "ADMIN" | "REGISTRAR" | "VOTER" }) =>
  prisma.user.create({
    data: { email: data.email, passwordHash: data.passwordHash, role: data.role ?? "VOTER" },
  });

export const findByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email } });

export const findById = (id: string) =>
  prisma.user.findUnique({ where: { id } });

export const activateUser = (id: string) =>
  prisma.user.update({ where: { id }, data: { isActive: true } });
