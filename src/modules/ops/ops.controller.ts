import { Controller, Get, Post, Query, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { Roles } from "@/common/auth/roles.decorator";
import { getRequestContext } from "@/common/http/request-context";
import { AuditService } from "@/modules/audit/audit.service";
import { BatchService } from "@/modules/batch/batch.service";
import { TransfersService } from "@/modules/transfers/transfers.service";

@Controller("ops")
@Roles("OPS", "AUDITOR", "ADMIN")
export class OpsController {
  constructor(
    private readonly transfersService: TransfersService,
    private readonly auditService: AuditService,
    private readonly batchService: BatchService
  ) {}

  @Get("transfers/:transferRequestId")
  async getTransfer(@Req() request: FastifyRequest & { params: { transferRequestId: string } }) {
    return {
      data: await this.transfersService.getTransferById(request.params.transferRequestId, getRequestContext(request))
    };
  }

  @Get("audit-events")
  async getAuditEvents(
    @Query("resourceType") resourceType?: string,
    @Query("resourceId") resourceId?: string,
    @Query("correlationId") correlationId?: string,
    @Query("idempotencyKey") idempotencyKey?: string,
    @Query("limit") limit?: string
  ) {
    return {
      data: await this.auditService.search({
        ...(resourceType ? { resourceType } : {}),
        ...(resourceId ? { resourceId } : {}),
        ...(correlationId ? { correlationId } : {}),
        ...(idempotencyKey ? { idempotencyKey } : {}),
        ...(limit ? { limit: Number(limit) } : {})
      })
    };
  }

  @Post("batch-runs/:batchRunId/retry")
  async retryBatch(@Req() request: FastifyRequest & { params: { batchRunId: string } }) {
    return {
      data: await this.batchService.retryFailedItems(request.params.batchRunId, getRequestContext(request))
    };
  }
}
