import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { auditElectionParamSchema } from '../validators/audit.validator';
import {
  getAuditElections,
  getElectionAuditReport,
  verifyElectionChain,
} from '../controllers/audit.controller';

const router = Router();

/** Require AUDITOR role for all audit endpoints */
router.use(authenticate, requireRole('AUDITOR'));

/** GET /api/v1/audit/elections */
router.get('/elections', getAuditElections);

/** GET /api/v1/audit/elections/:id */
router.get('/elections/:id', validate({ params: auditElectionParamSchema }), getElectionAuditReport);

/** GET /api/v1/audit/elections/:id/verify */
router.get('/elections/:id/verify', validate({ params: auditElectionParamSchema }), verifyElectionChain);

export default router;
