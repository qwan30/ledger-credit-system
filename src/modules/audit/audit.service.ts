import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import type { RequestContext } from "@/common/http/request-context";
import { PrismaService } from "@/common/prisma/prisma.service";

export interface AuditRecordInput {
  actionType: string;
  resourceType: string;
  resourceId: string;
  metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(context: RequestContext | undefined, input: AuditRecordInput): Promise<void> {
    const auditData = {
      actorType: context?.actor?.actorType ?? "SYSTEM",
      actorId: context?.actor?.actorId ?? null,
      actionType: input.actionType,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      correlationId: context?.correlationId ?? null,
      idempotencyKey: context?.idempotencyKey ?? null,
      metadata: input.metadata ?? {}
    };

    await this.prisma.auditEvent.create({
      data: auditData
    });
  }

  async recordInTransaction(
    tx: Prisma.TransactionClient,
    context: RequestContext | undefined,
    input: AuditRecordInput
  ): Promise<void> {
    const auditData = {
      actorType: context?.actor?.actorType ?? "SYSTEM",
      actorId: context?.actor?.actorId ?? null,
      actionType: input.actionType,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      correlationId: context?.correlationId ?? null,
      idempotencyKey: context?.idempotencyKey ?? null,
      metadata: input.metadata ?? {}
    };

    await tx.auditEvent.create({
      data: auditData
    });
  }

  async search(filters: {
    resourceType?: string;
    resourceId?: string;
    correlationId?: string;
    idempotencyKey?: string;
    limit?: number;
  }) {
    return this.prisma.auditEvent.findMany({
      where: {
        ...(filters.resourceType ? { resourceType: filters.resourceType } : {}),
        ...(filters.resourceId ? { resourceId: filters.resourceId } : {}),
        ...(filters.correlationId ? { correlationId: filters.correlationId } : {}),
        ...(filters.idempotencyKey ? { idempotencyKey: filters.idempotencyKey } : {})
      },
      orderBy: {
        occurredAt: "desc"
      },
      take: filters.limit ?? 50
    });
  }
}
