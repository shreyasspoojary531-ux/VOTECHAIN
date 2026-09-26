import { ApiError } from "../middleware/errorHandler";
import * as aadhaarRepo from "../repositories/aadhaar.repository";
import * as voterRepo from "../repositories/voter.repository";
import * as userRepo from "../repositories/user.repository";
import * as passwordCrypto from "../crypto/password";
import { logEvent } from "./audit.service";

export async function searchAadhaar(filters: { q?: string; constituency?: string }) {
  return aadhaarRepo.search(filters);
}

/**
 * Registration phase: search Mock Aadhaar → verify age 18+ → verify alive →
 * check duplicate registration → create User + VoterProfile.
 */
export async function registerVoter(
  input: { aadhaarId: string; email: string; password: string },
  registrarId: string,
  registrarRole: string,
) {
  const citizen = await aadhaarRepo.findById(input.aadhaarId);
  if (!citizen) {
    throw new ApiError(404, "AADHAAR_NOT_FOUND", "No citizen found with that Aadhaar reference");
  }
  if (!citizen.isAlive) {
    throw new ApiError(400, "CITIZEN_DECEASED", "Citizen is marked deceased in the registry");
  }

  const age = (Date.now() - citizen.dateOfBirth.getTime()) / (365.25 * 24 * 3600 * 1000);
  if (age < 18) {
    throw new ApiError(400, "UNDERAGE", "Citizen is under 18 and cannot register");
  }

  const existingProfile = await voterRepo.findProfileByAadhaarId(citizen.id);
  if (existingProfile) {
    throw new ApiError(409, "DUPLICATE_REGISTRATION", "This citizen is already registered as a voter");
  }

  const existingUser = await userRepo.findByEmail(input.email);
  if (existingUser) {
    throw new ApiError(409, "EMAIL_TAKEN", "A user with that email already exists");
  }

  const passwordHash = await passwordCrypto.hash(input.password);
  const user = await userRepo.createVoterWithProfile({
    email: input.email,
    passwordHash,
    aadhaarId: citizen.id,
    constituency: citizen.constituency,
  });

  await logEvent({
    eventType: "VOTER_REGISTERED",
    actorUserId: registrarId,
    actorRole: registrarRole,
    metadata: { voterUserId: user.id, constituency: citizen.constituency },
  });

  return {
    userId: user.id,
    email: user.email,
    constituency: citizen.constituency,
    message: "Voter registered successfully",
  };
}

export async function listVoters(filters: { constituency?: string }) {
  return voterRepo.listVoters(filters);
}

export { voterRepo };
