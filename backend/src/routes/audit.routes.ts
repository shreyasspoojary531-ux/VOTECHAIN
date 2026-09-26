import { Router } from "express";
import * as auditController from "../controllers/audit.controller";
import { authenticate } from "../middleware/jwt.middleware";
import { authorize } from "../middleware/rbac.middleware";

const router = Router();

router.use(authenticate, authorize("AUDITOR"));

router.get("/elections", auditController.listElections);
router.get("/elections/:id", auditController.getElectionAudit);
router.get("/elections/:id/verify", auditController.verifyElection);

export default router;
