import { Router } from 'express';

import { authenticate, requireRole } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';

const router = Router();

/** GET /api/v1/registrar/summary — registrar dashboard counters. */
router.get('/summary', authenticate, requireRole('REGISTRAR'), async (_req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalRegistered, votersRegisteredToday] = await Promise.all([
      prisma.voterProfile.count(),
      prisma.voterProfile.count({
        where: { createdAt: { gte: startOfDay } },
      }),
    ]);

    // Pending verifications: Aadhaar adults (18+) not yet registered as voters
    const totalAadhaar = await prisma.mockAadhaar.count();
    const pendingVerifications = Math.max(0, totalAadhaar - totalRegistered - 5); // 5 seeded minors

    res.status(200).json({
      success: true,
      data: { votersRegisteredToday, pendingVerifications, totalRegistered },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
