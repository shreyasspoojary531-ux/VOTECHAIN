import { ApiError } from "../middleware/errorHandler";
import { prisma } from "../utils/prisma";
import * as electionRepo from "../repositories/election.repository";
import { logEvent } from "./audit.service";

/** Allowed lifecycle transitions: DRAFT → PUBLISHED → ACTIVE → CLOSED → RESULTS */
const TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PUBLISHED"],
  PUBLISHED: ["ACTIVE"],
  ACTIVE: ["CLOSED"],
  CLOSED: ["RESULTS"],
  RESULTS: [],
};

export async function createElection(
  input: { title: string; description?: string; constituency: string; startAt: Date; endAt: Date },
  adminId: string,
  adminRole: string,
) {
  const election = await electionRepo.createElection({ ...input, createdBy: adminId });
  await logEvent({
    eventType: "ELECTION_CREATED",
    electionId: election.id,
    actorUserId: adminId,
    actorRole: adminRole,
    metadata: { title: election.title },
  });
  return election;
}

export async function getElection(id: string) {
  const election = await electionRepo.findElectionById(id);
  if (!election) throw new ApiError(404, "ELECTION_NOT_FOUND", "Election not found");
  return election;
}

export async function listElections(filters: { status?: string; constituency?: string }) {
  return electionRepo.listElections(filters);
}

export async function patchElection(
  id: string,
  data: { title?: string; description?: string; constituency?: string; startAt?: Date; endAt?: Date },
  adminId: string,
  adminRole: string,
) {
  const election = await electionRepo.findElectionById(id);
  if (!election) throw new ApiError(404, "ELECTION_NOT_FOUND", "Election not found");
  if (election.status !== "DRAFT") {
    throw new ApiError(409, "ELECTION_LOCKED", "Only DRAFT elections can be edited");
  }
  const updated = await electionRepo.updateElection(id, data);
  await logEvent({
    eventType: "ELECTION_UPDATED",
    electionId: id,
    actorUserId: adminId,
    actorRole: adminRole,
  });
  return updated;
}

async function transition(
  id: string,
  to: "PUBLISHED" | "ACTIVE" | "CLOSED" | "RESULTS",
  adminId: string,
  adminRole: string,
) {
  const election = await electionRepo.findElectionById(id);
  if (!election) throw new ApiError(404, "ELECTION_NOT_FOUND", "Election not found");

  const allowed = TRANSITIONS[election.status] ?? [];
  if (!allowed.includes(to)) {
    throw new ApiError(409, "INVALID_TRANSITION", `Cannot move election from ${election.status} to ${to}`);
  }

  if (to === "ACTIVE") {
    const candidateCount = await electionRepo.countCandidates(id);
    if (candidateCount < 2) {
      throw new ApiError(400, "TOO_FEW_CANDIDATES", "An election needs at least 2 candidates to go active");
    }
  }

  // On PUBLISH, auto-grant eligibility to every verified voter profile in the
  // election's constituency (the registrar/enrollment step of Phase 1).
  if (to === "PUBLISHED") {
    const profiles = await prisma.voterProfile.findMany({
      where: { constituency: election.constituency, isVerified: true },
      select: { id: true },
    });
    for (const p of profiles) {
      await prisma.voterEligibility.upsert({
        where: { voterProfileId_electionId: { voterProfileId: p.id, electionId: id } },
        update: { eligible: true },
        create: { voterProfileId: p.id, electionId: id, eligible: true },
      });
    }
  }

  // RESULTS requires a real tally computed by the voting/results module;
  // status flips are handled there, so reaching here for RESULTS is
  // only valid via that path — guarded by declareResults.
  const updated = await electionRepo.updateElectionStatus(id, to);
  await logEvent({
    eventType: `ELECTION_${to}`,
    electionId: id,
    actorUserId: adminId,
    actorRole: adminRole,
  });
  return updated;
}

export async function publishElection(id: string, adminId: string, adminRole: string) {
  return transition(id, "PUBLISHED", adminId, adminRole);
}

export async function activateElection(id: string, adminId: string, adminRole: string) {
  return transition(id, "ACTIVE", adminId, adminRole);
}

export async function closeElection(id: string, adminId: string, adminRole: string) {
  return transition(id, "CLOSED", adminId, adminRole);
}

export { transition };
