import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { blockNumberParamSchema, txIdParamSchema } from '../validators/blockchain.validator';
import {
  getBlocks,
  getBlockByNumber,
  getTransactionByTxId,
  verifyTransaction,
} from '../controllers/blockchain.controller';

const router = Router();

/** GET /api/v1/blockchain/blocks — public explorer */
router.get('/blocks', getBlocks);

/** GET /api/v1/blockchain/blocks/:number */
router.get('/blocks/:number', validate({ params: blockNumberParamSchema }), getBlockByNumber);

/** GET /api/v1/blockchain/transactions/:txId */
router.get('/transactions/:txId', validate({ params: txIdParamSchema }), getTransactionByTxId);

/** GET /api/v1/blockchain/verify/:txId */
router.get('/verify/:txId', validate({ params: txIdParamSchema }), verifyTransaction);

export default router;
