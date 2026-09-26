import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { electionService } from '../services/election.service';

/** GET /admin/summary — Overall system stats for admin dashboard */
export async function getAdminSummary(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const summary = await electionService.adminSummary();
    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

/** POST /admin/mock-aadhaar — Create Mock Aadhaar record */
export async function createMockAadhaar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { aadhaarNumber, fullName, dateOfBirth, gender, mobileNumber, phone, address } = req.body;
    const record = await adminService.createMockAadhaar({
      aadhaarNumber,
      fullName,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      phone: phone || mobileNumber || '9876543210',
      address,
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

/** GET /admin/mock-aadhaar — List Mock Aadhaar records */
export async function listMockAadhaars(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string, 10) || 20));
    const search = (req.query.search as string) || '';

    const result = await adminService.listMockAadhaars(page, pageSize, search);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/** DELETE /admin/mock-aadhaar/:id — Delete Mock Aadhaar record */
export async function deleteMockAadhaar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await adminService.deleteMockAadhaar(req.params.id as string);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/** DELETE /admin/elections/:id — Delete election */
export async function deleteElection(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await adminService.deleteElection(req.params.id as string);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/** DELETE /admin/voters/:id — Delete registered voter */
export async function deleteVoter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await adminService.deleteVoter(req.params.id as string);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/** POST /admin/blockchain/reset — Reset Blockchain Ledger */
export async function resetBlockchain(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await adminService.resetBlockchain();
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
