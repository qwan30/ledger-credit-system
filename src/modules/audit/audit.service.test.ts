import { describe, expect, it, vi } from "vitest";

import { AuditService } from "@/modules/audit/audit.service";

describe("AuditService", () => {
  it("records audit events with actor and correlation metadata", async () => {
    const create = vi.fn().mockResolvedValue(undefined);
    const service = new AuditService({
      auditEvent: {
        create
      }
    } as never);

    await service.record(
      {
        correlationId: "corr-1",
        idempotencyKey: "idem-1",
        actor: {
          actorId: "admin-1",
          actorType: "ADMIN",
          roles: ["ADMIN"]
        }
      },
      {
        actionType: "transfer.created",
        resourceType: "transfer_request",
        resourceId: "transfer-1"
      }
    );

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorType: "ADMIN",
        actorId: "admin-1",
        correlationId: "corr-1",
        idempotencyKey: "idem-1"
      })
    });
  });

  it("records system audit events inside a transaction", async () => {
    const create = vi.fn().mockResolvedValue(undefined);
    const service = new AuditService({} as never);

    await service.recordInTransaction(
      {
        auditEvent: {
          create
        }
      } as never,
      undefined,
      {
        actionType: "batch.completed",
        resourceType: "batch_run",
        resourceId: "batch-1"
      }
    );

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorType: "SYSTEM",
        actorId: null
      })
    });
  });

  it("searches audit events with provided filters only", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const service = new AuditService({
      auditEvent: {
        findMany
      }
    } as never);

    await service.search({
      resourceType: "transfer_request",
      limit: 10
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        resourceType: "transfer_request"
      },
      orderBy: {
        occurredAt: "desc"
      },
      take: 10
    });
  });
});
