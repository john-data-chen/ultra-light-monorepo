import type { AuditAction } from "./schema";

import { db } from "./index";

/**
 * Records an audit log entry.
 *
 * Data-Permission Boundary: The summary field often contains line-item details
 * (e.g., amount, category). This is visible to admins in the activity trail
 * by design, treating admins as trusted compliance/governance auditors. Members
 * remain isolated. (Production hardening: redact amounts or restrict to aggregates
 * if line-item visibility is undesired).
 */
export async function recordAudit(
  actorId: number,
  action: AuditAction,
  entity: string,
  entityId: number | null,
  summary: string | null
) {
  try {
    await db.auditLog.create({
      data: {
        actorId,
        action,
        entity,
        entityId,
        summary
      }
    });
  } catch (error) {
    console.error("Failed to record audit log", error);
  }
}

export async function listRecentAudits(limit = 50) {
  return await db.auditLog.findMany({
    select: {
      id: true,
      actor: {
        select: {
          id: true,
          name: true,
          avatar: true,
          email: true
        }
      },
      action: true,
      entity: true,
      entityId: true,
      summary: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" },
    take: limit
  });
}
