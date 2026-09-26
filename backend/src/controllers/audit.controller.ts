import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service';

/** GET /api/v1/audit/elections — AUDITOR only */
export async function getAuditElections(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const list = await auditService.getAuditElections();
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
}

/** GET /api/v1/audit/elections/:id — AUDITOR only */
export async function getElectionAuditReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const report = await auditService.getElectionAuditReport(id);
    res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
}

/** GET /api/v1/audit/elections/:id/verify — AUDITOR only */
export async function verifyElectionChain(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const verification = await auditService.verifyElectionChain(id);
    res.status(200).json({ success: true, data: verification });
  } catch (err) {
    next(err);
  }
}
