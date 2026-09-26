import { Request, Response, NextFunction } from 'express';
import { blockchainService } from '../services/blockchain.service';

/** GET /api/v1/blockchain/blocks */
export async function getBlocks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const blocks = await blockchainService.getBlocks();
    res.status(200).json({ success: true, data: blocks });
  } catch (err) {
    next(err);
  }
}

/** GET /api/v1/blockchain/blocks/:number */
export async function getBlockByNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const number = parseInt(req.params.number as string, 10);
    const block = await blockchainService.getBlockByNumber(number);
    res.status(200).json({ success: true, data: block });
  } catch (err) {
    next(err);
  }
}

/** GET /api/v1/blockchain/transactions/:txId */
export async function getTransactionByTxId(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const txId = req.params.txId as string;
    const tx = await blockchainService.getTransactionByTxId(txId);
    res.status(200).json({ success: true, data: tx });
  } catch (err) {
    next(err);
  }
}

/** GET /api/v1/blockchain/verify/:txId */
export async function verifyTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const txId = req.params.txId as string;
    const verification = await blockchainService.verifyTransaction(txId);
    res.status(200).json({ success: true, data: verification });
  } catch (err) {
    next(err);
  }
}
