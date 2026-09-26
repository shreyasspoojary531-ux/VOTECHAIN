import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

export default router;
