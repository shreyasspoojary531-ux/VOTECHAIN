import { Request, Response, NextFunction } from 'express';

import { registrarService } from '../services/registrar.service';
import { AppError } from '../middleware/errorHandler';

/** GET /registrar/aadhaar/search */
export async function searchAadhaar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { aadhaarNumber, fullName } = req.query as {
      aadhaarNumber?: string;
      fullName?: string;
    };

    const results = await registrarService.searchAadhaar({ aadhaarNumber, fullName });

    res.status(200).json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

/** POST /registrar/register-voter */
export async function registerVoter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401, true, 'UNAUTHENTICATED');
    }

    const { aadhaarNumber } = req.body as { aadhaarNumber: string };
    const result = await registrarService.registerVoter(aadhaarNumber, req.user.userId);

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/** GET /registrar/voters */
export async function listVoters(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string, 10) || 20));

    const result = await registrarService.listVoters(page, pageSize);

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/** GET /registrar/voters/:id */
export async function getVoter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const voter = await registrarService.getVoterById(req.params.id as string);
    if (!voter) {
      throw new AppError('Voter not found', 404, true, 'VOTER_NOT_FOUND');
    }
    res.status(200).json({ success: true, data: voter });
  } catch (err) {
    next(err);
  }
}
