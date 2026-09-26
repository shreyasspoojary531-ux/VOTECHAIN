import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { updateCandidate, deleteCandidate } from '../controllers/election.controller';

const router = Router();

/** PATCH /api/v1/candidates/:id — ADMIN only */
router.patch('/:id', authenticate, requireRole('ADMIN'), updateCandidate);

/** DELETE /api/v1/candidates/:id — ADMIN only */
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteCandidate);

export default router;
