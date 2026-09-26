import { prisma } from "../utils/prisma";

export const search = (filters: { q?: string; constituency?: string }) =>
  prisma.mockAadhaar.findMany({
    where: {
      AND: [
        filters.constituency ? { constituency: filters.constituency } : {},
        filters.q
          ? {
              OR: [
                { fullName: { contains: filters.q, mode: "insensitive" } },
                { aadhaarNumber: { contains: filters.q } },
                { phone: { contains: filters.q } },
              ],
            }
          : {},
      ],
    },
    take: 25,
  });

export const findById = (id: string) => prisma.mockAadhaar.findUnique({ where: { id } });

export const countAll = () => prisma.mockAadhaar.count();
