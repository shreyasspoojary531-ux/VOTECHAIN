import { Router } from "express";
import * as registrarController from "../controllers/registrar.controller";
import { validate } from "../middleware/validate.middleware";
import { aadhaarSearchSchema, registerVoterSchema } from "../validators/registrar.validator";
import { authenticate } from "../middleware/jwt.middleware";
import { authorize } from "../middleware/rbac.middleware";

const router = Router();

router.use(authenticate);
router.use(authorize("REGISTRAR"));

router.get("/aadhaar/search", validate(aadhaarSearchSchema), registrarController.searchAadhaar);
router.post("/register-voter", validate(registerVoterSchema), registrarController.registerVoter);
router.get("/voters", registrarController.listVoters);

export default router;
