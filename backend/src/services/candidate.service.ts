import { ApiError } from "../middleware/errorHandler";
import * as electionRepo from "../repositories/election.repository";
import { logEvent } from "./audit.service";

export async function addCandidate(
  electionId: string,
  input: { name: string; party: string; symbol?: string; manifesto?: string },
  adminId: string,
  adminRole: string,
) {
  const election = await electionRepo.findElectionById(electionId);
  if (!election) throw new ApiError(404, "ELECTION_NOT_FOUND", "Election not found");
  if (election.status !== "DRAFT" && election.status !== "PUBLISHED") {
    throw new ApiError(409, "ELECTION_LOCKED", "Candidates can only be added before the election is ACTIVE");
  }
  const candidate = await electionRepo.createCandidate({ electionId, ...input });
  await logEvent({
    eventType: "CANDIDATE_ADDED",
    electionId,
    actorUserId: adminId,
    actorRole: adminRole,
    metadata: { candidateId: candidate.id, name: candidate.name },
  });
  return candidate;
}

export async function patchCandidate(
  candidateId: string,
  data: { name?: string; party?: string; symbol?: string; manifesto?: string },
  adminId: string,
  adminRole: string,
) {
  const candidate = await electionRepo.findCandidateById(candidateId);
  if (!candidate) throw new ApiError(404, "CANDIDATE_NOT_FOUND", "Candidate not found");
  const election = await electionRepo.findElectionById(candidate.electionId);
  if (election && election.status === "ACTIVE") {
    throw new ApiError(409, "ELECTION_LOCKED", "Cannot edit candidates while the election is ACTIVE");
  }
  const updated = await electionRepo.updateCandidate(candidateId, data);
  await logEvent({
    eventType: "CANDIDATE_UPDATED",
    electionId: candidate.electionId,
    actorUserId: adminId,
    actorRole: adminRole,
    metadata: { candidateId },
  });
  return updated;
}

export async function removeCandidate(candidateId: string, adminId: string, adminRole: string) {
  const candidate = await electionRepo.findCandidateById(candidateId);
  if (!candidate) throw new ApiError(404, "CANDIDATE_NOT_FOUND", "Candidate not found");
  const election = await electionRepo.findElectionById(candidate.electionId);
  if (election && (election.status === "ACTIVE" || election.status === "CLOSED")) {
    throw new ApiError(409, "ELECTION_LOCKED", "Cannot delete candidates once voting has begun");
  }
  await electionRepo.deleteCandidate(candidateId);
  await logEvent({
    eventType: "CANDIDATE_REMOVED",
    electionId: candidate.electionId,
    actorUserId: adminId,
    actorRole: adminRole,
    metadata: { candidateId },
  });
  return { id: candidateId, deleted: true };
}

export async function listCandidates(electionId: string) {
  const election = await electionRepo.findElectionById(electionId);
  if (!election) throw new ApiError(404, "ELECTION_NOT_FOUND", "Election not found");
  return electionRepo.listCandidates(electionId);
}
