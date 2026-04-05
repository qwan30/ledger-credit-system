import { describe, expect, it, vi } from "vitest";

import { AppException } from "@/common/errors/app-exception";
import { CreditService } from "@/modules/credit/credit.service";

describe("CreditService", () => {
  const context = {
    correlationId: "corr-1",
    idempotencyKey: "idem-1",
    actor: {
      actorId: "customer-1",
      actorType: "CUSTOMER" as const,
      roles: ["CUSTOMER"]
    }
  };

  it("creates a credit assessment that stops at manual review and persists the audit trail", async () => {
    const tx = {
      customer: {
        findUnique: vi.fn().mockResolvedValue({
          id: "customer-1",
          accounts: [
            {
              balanceProjection: {
                currentMinor: 500_000n
              }
            }
          ]
        })
      },
      transferRequest: {
        count: vi.fn().mockResolvedValueOnce(20).mockResolvedValueOnce(1)
      },
      creditProfileSnapshot: {
        create: vi.fn().mockResolvedValue({
          id: "snapshot-1"
        })
      },
      creditAssessment: {
        create: vi.fn().mockResolvedValue({
          id: "assessment-1",
          status: "REQUESTED"
        }),
        update: vi
          .fn()
          .mockResolvedValueOnce({
            id: "assessment-1",
            status: "DATA_COLLECTED"
          })
          .mockResolvedValueOnce({
            id: "assessment-1",
            status: "SCORED",
            score: 760,
            rationaleSummary: "rationale"
          })
          .mockResolvedValueOnce({
            id: "assessment-1",
            status: "UNDER_REVIEW",
            score: 760,
            rationaleSummary: "rationale"
          })
      }
    } as never;
    const begin = vi.fn().mockResolvedValue({ recordId: "idem-record-1" });
    const complete = vi.fn().mockResolvedValue(undefined);
    const recordInTransaction = vi.fn().mockResolvedValue(undefined);
    const service = new CreditService(
      {
        $transaction: vi.fn((callback) => callback(tx))
      } as never,
      {
        scoreApproveThreshold: 700,
        scoreRejectThreshold: 550
      } as never,
      {
        recordInTransaction
      } as never,
      {
        begin,
        complete
      } as never
    );

    const result = await service.createAssessment(
      {
        customerId: "customer-1",
        requestedBy: "ops-user"
      },
      context
    );

    expect(begin).toHaveBeenCalled();
    expect(complete).toHaveBeenCalled();
    expect(recordInTransaction).toHaveBeenCalled();
    expect(result).toEqual({
      statusCode: 202,
      body: {
        data: {
          creditAssessmentId: "assessment-1",
          status: "UNDER_REVIEW",
          score: 760,
          rationaleSummary: "rationale"
        }
      }
    });
  });

  it("replays an existing idempotent assessment", async () => {
    const service = new CreditService(
      {
        $transaction: vi.fn((callback) =>
          callback({})
        )
      } as never,
      {
        scoreApproveThreshold: 700,
        scoreRejectThreshold: 550
      } as never,
      {
        recordInTransaction: vi.fn()
      } as never,
      {
        begin: vi.fn().mockResolvedValue({
          replay: {
            statusCode: 202,
            body: {
              data: {
                creditAssessmentId: "assessment-1",
                status: "UNDER_REVIEW"
              }
            }
          }
        })
      } as never
    );

    await expect(
      service.createAssessment(
        {
          customerId: "customer-1",
          requestedBy: "ops-user"
        },
        context
      )
    ).resolves.toEqual({
      statusCode: 202,
      body: {
        data: {
          creditAssessmentId: "assessment-1",
          status: "UNDER_REVIEW"
        }
      }
    });
  });

  it("requires an idempotency key", async () => {
    const service = new CreditService(
      {} as never,
      {
        scoreApproveThreshold: 700,
        scoreRejectThreshold: 550
      } as never,
      {} as never,
      {} as never
    );

    await expect(
      service.createAssessment(
        {
          customerId: "customer-1",
          requestedBy: "ops-user"
        },
        {
          correlationId: "corr-1",
          actor: context.actor
        }
      )
    ).rejects.toBeInstanceOf(AppException);
  });

  it("returns persisted assessment details", async () => {
    const service = new CreditService(
      {
        creditAssessment: {
          findUnique: vi.fn().mockResolvedValue({
            id: "assessment-1",
            customerId: "customer-1",
            status: "UNDER_REVIEW",
            score: 755,
            rationaleSummary: "strong-history",
            requestedBy: "ops-user",
            reviewedByActorId: null,
            reviewedByActorType: null,
            reviewDecisionedAt: null,
            reviewRationale: null,
            creditProfileSnapshot: {
              paymentHistoryPoints: 200,
              averageBalanceMinor: 500_000n,
              transactionFrequency: 18,
              snapshotVersion: "v1"
            }
          })
        }
      } as never,
      {
        scoreApproveThreshold: 700,
        scoreRejectThreshold: 550
      } as never,
      {} as never,
      {} as never
    );

    await expect(service.getAssessmentById("assessment-1", context)).resolves.toEqual({
      creditAssessmentId: "assessment-1",
      customerId: "customer-1",
      status: "UNDER_REVIEW",
      score: 755,
      rationaleSummary: "strong-history",
      requestedBy: "ops-user",
      reviewDecision: null,
      profileSnapshot: {
        paymentHistoryPoints: 200,
        averageBalanceMinor: 500000,
        transactionFrequency: 18,
        snapshotVersion: "v1"
      }
    });
  });

  it("approves an assessment under review and records reviewer metadata", async () => {
    const update = vi.fn().mockResolvedValue({
      id: "assessment-1",
      customerId: "customer-1",
      status: "APPROVED",
      score: 740,
      rationaleSummary: "stable inflows",
      requestedBy: "ops-user",
      reviewedByActorId: "analyst-1",
      reviewedByActorType: "ANALYST",
      reviewDecisionedAt: new Date("2026-03-16T00:00:00.000Z"),
      reviewRationale: "manual review approved",
      creditProfileSnapshot: {
        paymentHistoryPoints: 180,
        averageBalanceMinor: 450_000n,
        transactionFrequency: 14,
        snapshotVersion: "v1"
      }
    });
    const service = new CreditService(
      {
        creditAssessment: {
          findUnique: vi.fn().mockResolvedValue({
            id: "assessment-1",
            customerId: "customer-1",
            status: "UNDER_REVIEW"
          }),
          update
        }
      } as never,
      {
        scoreApproveThreshold: 700,
        scoreRejectThreshold: 550
      } as never,
      {
        record: vi.fn().mockResolvedValue(undefined)
      } as never,
      {} as never
    );

    const result = await service.reviewAssessment(
      "assessment-1",
      {
        decision: "APPROVED",
        reviewRationale: "manual review approved"
      },
      {
        correlationId: "corr-review-1",
        actor: {
          actorId: "analyst-1",
          actorType: "ANALYST",
          roles: ["ANALYST"]
        }
      }
    );

    expect(update).toHaveBeenCalled();
    expect(result.status).toBe("APPROVED");
    expect(result.reviewDecision).toEqual({
      reviewedBy: {
        actorId: "analyst-1",
        actorType: "ANALYST"
      },
      reviewedAt: "2026-03-16T00:00:00.000Z",
      rationale: "manual review approved"
    });
  });

  it("rejects review actions for assessments that are not under review", async () => {
    const service = new CreditService(
      {
        creditAssessment: {
          findUnique: vi.fn().mockResolvedValue({
            id: "assessment-1",
            customerId: "customer-1",
            status: "APPROVED"
          })
        }
      } as never,
      {
        scoreApproveThreshold: 700,
        scoreRejectThreshold: 550
      } as never,
      {
        record: vi.fn().mockResolvedValue(undefined)
      } as never,
      {} as never
    );

    await expect(
      service.reviewAssessment(
        "assessment-1",
        {
          decision: "REJECTED",
          reviewRationale: "manual review rejected"
        },
        {
          correlationId: "corr-review-2",
          actor: {
            actorId: "analyst-1",
            actorType: "ANALYST",
            roles: ["ANALYST"]
          }
        }
      )
    ).rejects.toBeInstanceOf(AppException);
  });
});
