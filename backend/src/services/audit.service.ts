import { prisma } from "../utils/prisma";
import { logger } from "../utils/logger";

export interface AuditEvent {
  eventType: string;
  electionId?: string;
  actorUserId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Writes an AuditRecord row. Deliberately generic — every later module
 * (registrar, election, voting, blockchain) imports this unchanged.
 */
export async function logEvent(event: AuditEvent): Promise<void> {
  try {
    await prisma.auditRecord.create({
      data: {
        eventType: event.eventType,
        electionId: event.electionId,
        actorUserId: event.actorUserId,
        metadata: event.metadata ? JSON.stringify(event.metadata) : undefined,
      },
    });
  } catch (err) {
    // Audit logging must never break the main flow.
    logger.error({ err, event }, "Failed to write audit record");
  }
}
