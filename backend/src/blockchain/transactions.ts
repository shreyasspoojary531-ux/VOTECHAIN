import crypto from 'crypto';
import { logger } from '../utils/logger';

export function formatBallotHash(electionId: string, candidateId: string, credentialHash: string): string {
  const nonce = crypto.randomBytes(8).toString('hex');
  return crypto
    .createHash('sha256')
    .update(`${electionId}:${candidateId}:${credentialHash}:${nonce}`)
    .digest('hex');
}

export function logTransactionSubmitted(txId: string, electionId: string): void {
  logger.info(`[Blockchain Event] Vote Transaction Committed - TxID: ${txId}, ElectionID: ${electionId}`);
}
