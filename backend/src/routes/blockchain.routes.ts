import { Router } from "express";
import * as blockchainController from "../controllers/blockchain.controller";
import { authenticate } from "../middleware/jwt.middleware";
import { authorize } from "../middleware/rbac.middleware";

const router = Router();

router.use(authenticate);

// Explorer access: auditors (admins may also inspect in demos)
router.get("/blocks", authorize("AUDITOR", "ADMIN"), blockchainController.listBlocks);
router.get("/blocks/:number", authorize("AUDITOR", "ADMIN"), blockchainController.getBlock);
router.get("/transactions/:txId", authorize("AUDITOR", "ADMIN"), blockchainController.getTransaction);
router.get("/verify/:txId", authorize("AUDITOR", "ADMIN"), blockchainController.verifyTransaction);

export default router;
