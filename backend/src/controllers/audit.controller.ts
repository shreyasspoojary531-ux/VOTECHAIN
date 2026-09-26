import type { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import * as fabric from "../blockchain/fabric.service";
import * as electionRepo from "../repositories/election.repository";
import { ok, fail } from "../utils/response";
import { ApiError } from "../middleware/errorHandler";
import { asyncHandler } from "../utils/asyncHandler";

export const listElections = asyncHandler(async (_req: Request, res: Response) => {
  const elections = await electionRepo.listElections({});
  const withCounts = await Promise.all(
    elections.map(async (e) => ({
      id: e.id,
      title: e.title,
      status: e.status,
      constituency: e.constituency,
      auditCount: await prisma.auditRecord.count({ where: { electionId: e.id } }),
    })),
  );
  ok(res, withCounts);
});

export const getElectionAudit = asyncHandler(async (req: Request, res: Response) => {
  const electionId = req.params.id;
  const election = await electionRepo.findElectionById(electionId);
  if (!election) {
    fail(res, 404, "ELECTION_NOT_FOUND", "Election not found");
    return;
  }
  const records = await prisma.auditRecord.findMany({
    where: { electionId },
    orderBy: { timestamp: "asc" },
    take: 200,
  });
  ok(res, { election: { id: election.id, title: election.title, status: election.status }, records });
});

/** Full integrity verification: chain walk + ballot↔tx cross-check. */
export const verifyElection = asyncHandler(async (req: Request, res: Response) => {
  const electionId = req.params.id;
  const election = await electionRepo.findElectionById(electionId);
  if (!election) {
    throw new ApiError(404, "ELECTION_NOT_FOUND", "Election not found");
  }

  const ballots = await prisma.ballot.findMany({
    where: { credential: { electionId } },
    include: { blockchainTx: true },
  });

  const chain = await fabric.verifyElectionChain();

  const missingTx = ballots.filter((b) => !b.blockchainTx).length;
  const invalidTx = ballots.filter((b) => b.blockchainTx && b.blockchainTx.status !== "VALID").length;

  ok(res, {
    electionId,
    status: election.status,
    chainValid: chain.chainValid,
    chainReason: chain.reason,
    blocksChecked: chain.blocksChecked,
    ballotsChecked: ballots.length,
    ballotsWithoutTx: missingTx,
    invalidTransactions: invalidTx,
    verdict: chain.chainValid && missingTx === 0 && invalidTx === 0 ? "INTEGRITY_OK" : "INTEGRITY_FAILED",
  });
});
