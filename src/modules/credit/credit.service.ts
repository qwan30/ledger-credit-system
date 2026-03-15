import { Injectable } from "@nestjs/common";

import { assertAuthenticated, assertCustomerOwnsResource } from "@/common/auth/authorization";
import { AppConfigService } from "@/common/config/app-config.service";
import { AppException } from "@/common/errors/app-exception";
import { hashRequestPayload } from "@/common/idempotency/hash-request";
import { IdempotencyService } from "@/common/idempotency/idempotency.service";
import type { RequestContext } from "@/common/http/request-context";
import { PrismaService } from "@/common/prisma/prisma.service";
import { AuditService } from "@/modules/audit/audit.service";
import {
  computeCreditDecision,
  type CreditProfileInput
} from "@/modules/credit/domain/credit-scoring.policy";
import type { CreateCreditAssessmentRequest } from "@/modules/credit/credit.schemas";

@Injectable()
export class CreditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly auditService: AuditService,
    private readonly idempotencyService: IdempotencyService
  ) {}

  async createAssessment(input: CreateCreditAssessmentRequest, context: RequestContext) {
    assertAuthenticated(context);

    if (!context.idempotencyKey) {
      throw new AppException(400, "missing_idempotency_key", "Idempotency-Key header is required.");
    }

    const idempotencyKey = context.idempotencyKey;
    const requestHash = hashRequestPayload(input);

    const result = await this.prisma.$transaction(async (tx) => {
      const idempotency = await this.idempotencyService.begin(tx, "credit-assessment.create", idempotencyKey, requestHash);

      if (idempotency.replay) {
        return {
          statusCode: idempotency.replay.statusCode,
          body: idempotency.replay.body
        };
      }

      const customer = await tx.customer.findUnique({
        where: { id: input.customerId },
        include: {
          accounts: {
            include: {
              balanceProjection: true
            }
          }
        }
      });

      if (!customer) {
        throw new AppException(404, "customer_not_found", "Customer was not found.");
      }

      assertCustomerOwnsResource(context, customer.id);

      const settledTransferCount = await tx.transferRequest.count({
        where: {
          sourceAccount: {
            customerId: customer.id
          },
          status: "SETTLED"
        }
      });
      const failedTransferCount = await tx.transferRequest.count({
        where: {
          sourceAccount: {
            customerId: customer.id
          },
          status: {
            in: ["FAILED", "COMPENSATED"]
          }
        }
      });

      const balanceValues = customer.accounts.map((account) => account.balanceProjection?.currentMinor ?? 0n);
      const averageBalanceMinor =
        balanceValues.length > 0
          ? balanceValues.reduce((sum, value) => sum + value, 0n) / BigInt(balanceValues.length)
          : 0n;
      const profileInput: CreditProfileInput = {
        paymentHistoryPoints: Math.max(0, 120 + settledTransferCount * 12 - failedTransferCount * 20),
        averageBalanceMinor,
        transactionFrequency: settledTransferCount
      };
      const decision = computeCreditDecision(profileInput, {
        approveThreshold: this.config.scoreApproveThreshold,
        rejectThreshold: this.config.scoreRejectThreshold
      });

      const snapshot = await tx.creditProfileSnapshot.create({
        data: {
          customerId: customer.id,
          paymentHistoryPoints: profileInput.paymentHistoryPoints,
          averageBalanceMinor: profileInput.averageBalanceMinor,
          transactionFrequency: profileInput.transactionFrequency,
          snapshotVersion: "v1",
          snapshotData: {
            settledTransferCount,
            failedTransferCount
          }
        }
      });

      let assessment = await tx.creditAssessment.create({
        data: {
          customerId: customer.id,
          creditProfileSnapshotId: snapshot.id,
          status: "REQUESTED",
          policyVersion: "v1",
          requestedBy: input.requestedBy,
          approvedThreshold: this.config.scoreApproveThreshold,
          rejectedThreshold: this.config.scoreRejectThreshold
        }
      });

      assessment = await tx.creditAssessment.update({
        where: { id: assessment.id },
        data: {
          status: "DATA_COLLECTED"
        }
      });

      assessment = await tx.creditAssessment.update({
        where: { id: assessment.id },
        data: {
          status: "SCORED",
          score: decision.score,
          rationaleSummary: decision.rationaleSummary
        }
      });

      assessment = await tx.creditAssessment.update({
        where: { id: assessment.id },
        data: {
          status: decision.status
        }
      });

      const responseBody = {
        data: {
          creditAssessmentId: assessment.id,
          status: assessment.status,
          score: assessment.score,
          rationaleSummary: assessment.rationaleSummary
        }
      };

      await this.idempotencyService.complete(
        tx,
        idempotency.recordId!,
        200,
        responseBody,
        "credit_assessment",
        assessment.id
      );
      await this.auditService.recordInTransaction(tx, context, {
        actionType: "credit_assessment.created",
        resourceType: "credit_assessment",
        resourceId: assessment.id,
        metadata: {
          customerId: customer.id,
          status: assessment.status
        }
      });

      return {
        statusCode: 200,
        body: responseBody
      };
    });

    return result;
  }

  async getAssessmentById(creditAssessmentId: string, context: RequestContext) {
    const assessment = await this.prisma.creditAssessment.findUnique({
      where: { id: creditAssessmentId },
      include: {
        customer: true,
        creditProfileSnapshot: true
      }
    });

    if (!assessment) {
      throw new AppException(404, "credit_assessment_not_found", "Credit assessment was not found.");
    }

    assertCustomerOwnsResource(context, assessment.customerId);

    return {
      creditAssessmentId: assessment.id,
      customerId: assessment.customerId,
      status: assessment.status,
      score: assessment.score,
      rationaleSummary: assessment.rationaleSummary,
      requestedBy: assessment.requestedBy,
      profileSnapshot: {
        paymentHistoryPoints: assessment.creditProfileSnapshot.paymentHistoryPoints,
        averageBalanceMinor: Number(assessment.creditProfileSnapshot.averageBalanceMinor),
        transactionFrequency: assessment.creditProfileSnapshot.transactionFrequency,
        snapshotVersion: assessment.creditProfileSnapshot.snapshotVersion
      }
    };
  }
}
