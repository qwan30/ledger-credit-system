import { Controller, Get, HttpCode, Inject, Post, Query, Req, Res } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";

import { Roles } from "@/common/auth/roles.decorator";
import { parseSchema } from "@/common/http/parse-schema";
import { getRequestContext } from "@/common/http/request-context";
import { AuditService } from "@/modules/audit/audit.service";
import { BatchService } from "@/modules/batch/batch.service";
import { CreditService } from "@/modules/credit/credit.service";
import { reviewCreditAssessmentSchema } from "@/modules/credit/credit.schemas";
import { ExternalRailService } from "@/modules/transfers/external-rail.service";
import { TransfersService } from "@/modules/transfers/transfers.service";

@Controller("ops")
@Roles("OPS", "AUDITOR", "ADMIN")
export class OpsController {
  constructor(
    @Inject(TransfersService) private readonly transfersService: TransfersService,
    @Inject(ExternalRailService) private readonly externalRailService: ExternalRailService,
    @Inject(CreditService) private readonly creditService: CreditService,
    @Inject(AuditService) private readonly auditService: AuditService,
    @Inject(BatchService) private readonly batchService: BatchService
  ) {}

  @Get("transfers/:transferRequestId")
  async getTransfer(@Req() request: FastifyRequest & { params: { transferRequestId: string } }) {
    return {
      data: await this.transfersService.getTransferById(request.params.transferRequestId, getRequestContext(request))
    };
  }

  @Get("transfers/:transferRequestId/external-events")
  async getTransferExternalEvents(@Req() request: FastifyRequest & { params: { transferRequestId: string } }) {
    return {
      data: await this.externalRailService.getExternalEvents(request.params.transferRequestId)
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

  @HttpCode(200)
  @Post("batch-runs/:batchRunId/retry")
  async retryBatch(@Req() request: FastifyRequest & { params: { batchRunId: string } }) {
    return {
      data: await this.batchService.retryFailedItems(request.params.batchRunId, getRequestContext(request))
    };
  }

  @Roles("OPS", "ADMIN")
  @HttpCode(202)
  @Post("transfers/:transferRequestId/redrive")
  async redriveTransfer(
    @Req() request: FastifyRequest & { params: { transferRequestId: string } },
    @Res({ passthrough: true }) reply: FastifyReply
  ) {
    reply.status(202);

    return {
      data: await this.externalRailService.redriveTransfer(request.params.transferRequestId, getRequestContext(request))
    };
  }

  @Roles("OPS", "ADMIN")
  @HttpCode(200)
  @Post("transfers/:transferRequestId/reconcile")
  async reconcileTransfer(@Req() request: FastifyRequest & { params: { transferRequestId: string } }) {
    return {
      data: await this.externalRailService.reconcileTransfer(request.params.transferRequestId, getRequestContext(request))
    };
  }

  @Roles("ANALYST", "ADMIN")
  @HttpCode(200)
  @Post("credit-assessments/:creditAssessmentId/approve")
  async approveCreditAssessment(@Req() request: FastifyRequest & { params: { creditAssessmentId: string } }) {
    const input = parseSchema(reviewCreditAssessmentSchema, request.body);

    return {
      data: await this.creditService.reviewAssessment(
        request.params.creditAssessmentId,
        {
          ...input,
          decision: "APPROVED"
        },
        getRequestContext(request)
      )
    };
  }

  @Roles("ANALYST", "ADMIN")
  @HttpCode(200)
  @Post("credit-assessments/:creditAssessmentId/reject")
  async rejectCreditAssessment(@Req() request: FastifyRequest & { params: { creditAssessmentId: string } }) {
    const input = parseSchema(reviewCreditAssessmentSchema, request.body);

    return {
      data: await this.creditService.reviewAssessment(
        request.params.creditAssessmentId,
        {
          ...input,
          decision: "REJECTED"
        },
        getRequestContext(request)
      )
    };
  }
}
