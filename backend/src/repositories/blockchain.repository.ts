import { prisma } from '../utils/prisma';

export const blockchainRepository = {
  async getTransactions(page: number, pageSize: number) {
    const [total, items] = await Promise.all([
      prisma.blockchainTransaction.count(),
      prisma.blockchainTransaction.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          election: { select: { id: true, title: true } },
        },
      }),
    ]);

    return { total, items, page, pageSize };
  },

  async findByTxId(txId: string) {
    return prisma.blockchainTransaction.findUnique({
      where: { txId },
      include: {
        election: { select: { id: true, title: true } },
        ballot: { select: { ballotHash: true, createdAt: true } },
      },
    });
  },
};
