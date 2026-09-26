import { Router } from "express";
import * as electionController from "../controllers/election.controller";
import * as candidateController from "../controllers/candidate.controller";
import { validate } from "../middleware/validate.middleware";
import {
  createElectionSchema,
  updateElectionSchema,
  listElectionsSchema,
  createCandidateSchema,
  updateCandidateSchema,
} from "../validators/election.validator";
import { authenticate } from "../middleware/jwt.middleware";
import { authorize } from "../middleware/rbac.middleware";
import * as resultsController from "../controllers/vote.controller.results";

const router = Router();

// Authenticated read access to elections/candidates
router.get("/", authenticate, validate(listElectionsSchema), electionController.listElections);
router.get("/:id", authenticate, electionController.getElection);
router.get("/:id/candidates", authenticate, candidateController.listCandidates);

// ADMIN-only lifecycle management
router.post("/", authenticate, authorize("ADMIN"), validate(createElectionSchema), electionController.createElection);
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateElectionSchema), electionController.patchElection);
router.post("/:id/publish", authenticate, authorize("ADMIN"), electionController.publishElection);
router.post("/:id/activate", authenticate, authorize("ADMIN"), electionController.activateElection);
router.post("/:id/close", authenticate, authorize("ADMIN"), electionController.closeElection);
router.post("/:id/results", authenticate, authorize("ADMIN"), resultsController.declareResults);

// Candidate management (ADMIN)
router.post(
  "/:id/candidates",
  authenticate,
  authorize("ADMIN"),
  validate(createCandidateSchema),
  candidateController.addCandidate,
);
router.patch(
  "/candidates/:candidateId",
  authenticate,
  authorize("ADMIN"),
  validate(updateCandidateSchema),
  candidateController.patchCandidate,
);
router.delete("/candidates/:candidateId", authenticate, authorize("ADMIN"), candidateController.deleteCandidate);

export default router;
