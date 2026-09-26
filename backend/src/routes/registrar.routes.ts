import { Router } from 'express';

import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { aadhaarSearchQuerySchema, registerVoterBodySchema } from '../validators/registrar.validator';
import {
  searchAadhaar,
  registerVoter,
  listVoters,
  getVoter,
} from '../controllers/registrar.controller';

const router = Router();

// All registrar routes require a valid JWT + REGISTRAR role
router.use(authenticate, requireRole('REGISTRAR'));

/** GET /api/v1/registrar/aadhaar/search?aadhaarNumber=... | ?fullName=... */
router.get('/aadhaar/search', validate({ query: aadhaarSearchQuerySchema }), searchAadhaar);

/** POST /api/v1/registrar/register-voter  body: { aadhaarNumber } */
router.post('/register-voter', validate({ body: registerVoterBodySchema }), registerVoter);

/** GET /api/v1/registrar/voters?page=1&pageSize=20 */
router.get('/voters', listVoters);

/** GET /api/v1/registrar/voters/:id */
router.get('/voters/:id', getVoter);

export default router;
