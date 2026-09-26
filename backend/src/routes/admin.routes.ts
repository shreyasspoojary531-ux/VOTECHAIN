import { Router } from 'express';

import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createMockAadhaarBodySchema,
  idParamSchema,
  listQuerySchema,
} from '../validators/admin.validator';
import {
  createMockAadhaar,
  listMockAadhaars,
  deleteMockAadhaar,
  deleteElection,
  deleteVoter,
  getAdminSummary,
} from '../controllers/admin.controller';

const router = Router();

// All routes require valid JWT + ADMIN role
router.use(authenticate, requireRole('ADMIN'));

/** GET /api/v1/admin/summary */
router.get('/summary', getAdminSummary);

/** GET /api/v1/admin/mock-aadhaar */
router.get('/mock-aadhaar', validate({ query: listQuerySchema }), listMockAadhaars);

/** POST /api/v1/admin/mock-aadhaar */
router.post('/mock-aadhaar', validate({ body: createMockAadhaarBodySchema }), createMockAadhaar);

/** DELETE /api/v1/admin/mock-aadhaar/:id */
router.delete('/mock-aadhaar/:id', validate({ params: idParamSchema }), deleteMockAadhaar);

/** DELETE /api/v1/admin/elections/:id */
router.delete('/elections/:id', validate({ params: idParamSchema }), deleteElection);

/** DELETE /api/v1/admin/voters/:id */
router.delete('/voters/:id', validate({ params: idParamSchema }), deleteVoter);

export default router;
