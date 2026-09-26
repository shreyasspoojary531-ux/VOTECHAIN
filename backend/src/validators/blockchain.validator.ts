import { z } from 'zod';

export const blockNumberParamSchema = z.object({
  number: z.coerce.number().int().min(0, 'Block number must be non-negative'),
});

export const txIdParamSchema = z.object({
  txId: z.string().min(3, 'Invalid transaction ID'),
});
