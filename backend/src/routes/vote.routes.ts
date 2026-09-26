import { Router } from "express";
import * as voteController from "../controllers/vote.controller";
import { validate } from "../middleware/validate.middleware";
import { requestCredentialSchema, castVoteSchema } from "../validators/vote.validator";
import { authenticate } from "../middleware/jwt.middleware";
import { authorize } from "../middleware/rbac.middleware";

const router = Router();

router.use(authenticate);

router.post("/credential", authorize("VOTER"), validate(requestCredentialSchema), voteController.requestCredential);
router.post("/", authorize("VOTER"), validate(castVoteSchema), voteController.castVote);
router.get("/status", authorize("VOTER"), voteController.voteStatus);
router.get("/receipt/:txId", voteController.getReceipt);

export default router;
