import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  credentialBodySchema,
  castVoteBodySchema,
  voteStatusQuerySchema,
  receiptParamSchema,
} from '../validators/voting.validator';
import {
  issueCredential,
  castVote,
  getVotingStatus,
  getReceipt,
} from '../controllers/voting.controller';

const router = Router();

/** POST /api/v1/votes/credential — VOTER only */
router.post(
  '/credential',
  authenticate,
  requireRole('VOTER'),
  validate({ body: credentialBodySchema }),
  issueCredential
);

/** POST /api/v1/votes — VOTER only */
router.post(
  '/',
  authenticate,
  requireRole('VOTER'),
  validate({ body: castVoteBodySchema }),
  castVote
);

/** GET /api/v1/votes/status — VOTER only */
router.get(
  '/status',
  authenticate,
  requireRole('VOTER'),
  validate({ query: voteStatusQuerySchema }),
  getVotingStatus
);

/** GET /api/v1/votes/receipt/:txId — Public / Voter */
router.get('/receipt/:txId', validate({ params: receiptParamSchema }), getReceipt);

export default router;
