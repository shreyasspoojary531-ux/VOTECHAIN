import { Router } from 'express';

import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  listElectionsQuerySchema,
  createElectionBodySchema,
  idParamSchema,
} from '../validators/election.validator';
import {
  listElections,
  getElection,
  createElection,
  updateElection,
  publishElection,
  closeElection,
  publishElectionResults,
  getElectionResults,
  getCandidates,
  addCandidate,
} from '../controllers/election.controller';
import { electionService } from '../services/election.service';

const router = Router();

/** GET /api/v1/elections — public browse. */
router.get('/', validate({ query: listElectionsQuerySchema }), listElections);

/** POST /api/v1/elections — ADMIN only. */
router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  validate({ body: createElectionBodySchema }),
  createElection
);

/** GET /api/v1/elections/:id — public detail. */
router.get('/:id', validate({ params: idParamSchema }), getElection);

/** PATCH /api/v1/elections/:id — ADMIN only. */
router.patch('/:id', authenticate, requireRole('ADMIN'), validate({ params: idParamSchema }), updateElection);

/** POST /api/v1/elections/:id/publish — ADMIN only. */
router.post(
  '/:id/publish',
  authenticate,
  requireRole('ADMIN'),
  validate({ params: idParamSchema }),
  publishElection
);

/** POST /api/v1/elections/:id/close — ADMIN only. */
router.post(
  '/:id/close',
  authenticate,
  requireRole('ADMIN'),
  validate({ params: idParamSchema }),
  closeElection
);

/** POST /api/v1/elections/:id/results — ADMIN only. */
router.post(
  '/:id/results',
  authenticate,
  requireRole('ADMIN'),
  validate({ params: idParamSchema }),
  publishElectionResults
);

/** GET /api/v1/elections/:id/results — public tally. */
router.get('/:id/results', validate({ params: idParamSchema }), getElectionResults);

/** GET /api/v1/elections/:id/candidates — candidates list */
router.get('/:id/candidates', validate({ params: idParamSchema }), getCandidates);

/** POST /api/v1/elections/:id/candidates — ADMIN only */
router.post(
  '/:id/candidates',
  authenticate,
  requireRole('ADMIN'),
  validate({ params: idParamSchema }),
  addCandidate
);

/** PUT /api/v1/elections/:id/candidates — ADMIN update candidate roster */
router.put(
  '/:id/candidates',
  authenticate,
  requireRole('ADMIN'),
  validate({ params: idParamSchema }),
  async (req, res, next) => {
    try {
      const candidates = req.body.candidates as Array<{ name: string; partyName: string }>;
      for (const c of candidates || []) {
        await electionService.addCandidate(req.params.id as string, {
          name: c.name,
          party: c.partyName,
        });
      }
      const updated = await electionService.getById(req.params.id as string);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
