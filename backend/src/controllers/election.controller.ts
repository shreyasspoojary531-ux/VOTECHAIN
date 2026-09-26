import { Request, Response, NextFunction } from 'express';
import { electionService } from '../services/election.service';
import { AppError } from '../middleware/errorHandler';

/** GET /elections — public, supports ?status=&page=&pageSize= */
export async function listElections(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = req.query.status as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string, 10) || 50));

    const wantsPagination = req.query.page !== undefined || req.query.pageSize !== undefined;

    if (wantsPagination) {
      const result = await electionService.list(status, page, pageSize);
      res.status(200).json({ success: true, data: result });
    } else {
      const result = await electionService.list(status, 1, 100);
      res.status(200).json({ success: true, data: result.items });
    }
  } catch (err) {
    next(err);
  }
}

/** GET /elections/:id — public. */
export async function getElection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const election = await electionService.getById(req.params.id as string);
    res.status(200).json({ success: true, data: election });
  } catch (err) {
    next(err);
  }
}

/** POST /elections — ADMIN only */
export async function createElection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401, true, 'UNAUTHENTICATED');
    }

    const { title, description, startsAt, endsAt, candidates } = req.body;

    const election = await electionService.create(
      {
        title,
        description,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        candidates: candidates || [],
      },
      req.user.userId
    );

    res.status(201).json({ success: true, data: election });
  } catch (err) {
    next(err);
  }
}

/** PATCH /elections/:id — ADMIN only */
export async function updateElection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, startsAt, endsAt } = req.body;
    const election = await electionService.update(req.params.id as string, {
      title,
      description,
      startsAt: startsAt ? new Date(startsAt) : undefined,
      endsAt: endsAt ? new Date(endsAt) : undefined,
    });
    res.status(200).json({ success: true, data: election });
  } catch (err) {
    next(err);
  }
}

/** POST /elections/:id/publish — ADMIN only */
export async function publishElection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const election = await electionService.publish(req.params.id as string);
    res.status(200).json({ success: true, data: election });
  } catch (err) {
    next(err);
  }
}

/** POST /elections/:id/close — ADMIN only */
export async function closeElection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const election = await electionService.close(req.params.id as string);
    res.status(200).json({ success: true, data: election });
  } catch (err) {
    next(err);
  }
}

/** POST /elections/:id/results — ADMIN only */
export async function publishElectionResults(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const election = await electionService.publishResults(req.params.id as string);
    res.status(200).json({ success: true, data: election });
  } catch (err) {
    next(err);
  }
}

/** GET /elections/:id/results — public tally with percentages. */
export async function getElectionResults(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const results = await electionService.results(req.params.id as string);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

/** GET /elections/:id/candidates */
export async function getCandidates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const candidates = await electionService.getCandidates(req.params.id as string);
    res.status(200).json({ success: true, data: candidates });
  } catch (err) {
    next(err);
  }
}

/** POST /elections/:id/candidates — ADMIN only */
export async function addCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, party, symbolUrl } = req.body;
    const candidate = await electionService.addCandidate(req.params.id as string, { name, party, symbolUrl });
    res.status(201).json({ success: true, data: candidate });
  } catch (err) {
    next(err);
  }
}

/** PATCH /candidates/:id — ADMIN only */
export async function updateCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, party, symbolUrl } = req.body;
    const candidate = await electionService.updateCandidate(req.params.id as string, { name, party, symbolUrl });
    res.status(200).json({ success: true, data: candidate });
  } catch (err) {
    next(err);
  }
}

/** DELETE /candidates/:id — ADMIN only */
export async function deleteCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await electionService.deleteCandidate(req.params.id as string);
    res.status(200).json({ success: true, data: { message: 'Candidate deleted successfully' } });
  } catch (err) {
    next(err);
  }
}
