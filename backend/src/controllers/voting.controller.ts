import { Request, Response, NextFunction } from 'express';
import { votingService } from '../services/voting.service';
import { AppError } from '../middleware/errorHandler';

/** POST /api/v1/votes/credential — VOTER only */
export async function issueCredential(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401, true, 'UNAUTHENTICATED');
    }
    const { electionId } = req.body;
    const result = await votingService.issueCredential(req.user.userId, electionId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/** POST /api/v1/votes — VOTER only */
export async function castVote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401, true, 'UNAUTHENTICATED');
    }
    const { electionId, candidateId, credentialHash, encryptedPayload } = req.body;
    const result = await votingService.castVote(req.user.userId, {
      electionId,
      candidateId,
      credentialHash,
      encryptedPayload,
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/** GET /api/v1/votes/status?electionId=... — VOTER only */
export async function getVotingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401, true, 'UNAUTHENTICATED');
    }
    const electionId = req.query.electionId as string;
    const status = await votingService.getVotingStatus(req.user.userId, electionId);
    res.status(200).json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
}

/** GET /api/v1/votes/receipt/:txId — Public / Voter */
export async function getReceipt(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const txId = req.params.txId as string;
    const receipt = await votingService.getReceipt(txId);
    res.status(200).json({ success: true, data: receipt });
  } catch (err) {
    next(err);
  }
}
