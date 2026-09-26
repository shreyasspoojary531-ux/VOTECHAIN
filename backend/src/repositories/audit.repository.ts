import { prisma } from '../utils/prisma';

export const auditRepository = {
  async getAuditElections() {
    const elections = await prisma.election.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        startDate: true,
        endDate: true,
        _count: {
          select: { ballots: true, auditRecords: true },
        },
      },
    });

    return elections.map((e) => ({
      id: e.id,
      title: e.title,
      status: e.status,
      startDate: e.startDate.getTime(),
      endDate: e.endDate.getTime(),
      totalVotes: e._count.ballots,
      totalAuditEvents: e._count.auditRecords,
    }));
  },

  async getElectionAudit(electionId: string) {
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: {
        auditRecords: {
          orderBy: { timestamp: 'desc' },
          take: 50,
          include: {
            actorUser: { select: { id: true, email: true, role: true } },
          },
        },
        _count: {
          select: { ballots: true, credentials: true, transactions: true },
        },
      },
    });

    if (!election) return null;

    const totalBallots = election._count.ballots;
    const totalTransactions = election._count.transactions;
    const isIntegrityVerified = totalBallots === totalTransactions;

    return {
      electionId: election.id,
      title: election.title,
      status: election.status,
      totalBallots,
      totalTransactions,
      isIntegrityVerified,
      auditedAt: Date.now(),
      auditTrail: election.auditRecords.map((record) => ({
        id: record.id,
        eventType: record.eventType,
        actorRole: record.actorUser?.role || 'SYSTEM',
        metadata: record.metadata,
        timestamp: record.timestamp.getTime(),
      })),
    };
  },
};
