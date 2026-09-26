import { prisma } from "../utils/prisma";
import { logger } from "../utils/logger";

export interface AuditEvent {
  eventType: string;
  electionId?: string;
  actorUserId?: string;
  actorRole?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Writes an AuditRecord row. Deliberately generic — every later module
 * (registrar, election, voting, blockchain) imports this unchanged.
 * `eventType` is stored in the `action` column per the master schema.
 */
export async function logEvent(event: AuditEvent): Promise<void> {
  try {
    await prisma.auditRecord.create({
      data: {
        action: event.eventType,
        electionId: event.electionId,
        actorId: event.actorUserId,
        actorRole: event.actorRole,
        metadata: event.metadata ? (event.metadata as object) : undefined,
      },
    });
  } catch (err) {
    // Audit logging must never break the main flow.
    logger.error({ err, event }, "Failed to write audit record");
  }
}
