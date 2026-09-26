import { Router } from 'express';

import { authenticate, requireRole } from '../middleware/auth.middleware';
import { electionRepository } from '../repositories/election.repository';

const router = Router();

/** GET /api/v1/admin/summary — ADMIN dashboard counters. */
router.get('/summary', authenticate, requireRole('ADMIN'), async (_req, res, next) => {
  try {
    const summary = await electionRepository.adminSummary();
    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

export default router;
