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

  it("creates an automated credit assessment and persists the audit trail", async () => {
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
            status: "APPROVED",
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
      statusCode: 200,
      body: {
        data: {
          creditAssessmentId: "assessment-1",
          status: "APPROVED",
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
            statusCode: 200,
            body: {
              data: {
                creditAssessmentId: "assessment-1",
                status: "APPROVED"
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
      statusCode: 200,
      body: {
        data: {
          creditAssessmentId: "assessment-1",
          status: "APPROVED"
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
            status: "APPROVED",
            score: 755,
            rationaleSummary: "strong-history",
            requestedBy: "ops-user",
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
      status: "APPROVED",
      score: 755,
      rationaleSummary: "strong-history",
      requestedBy: "ops-user",
      profileSnapshot: {
        paymentHistoryPoints: 200,
        averageBalanceMinor: 500000,
        transactionFrequency: 18,
        snapshotVersion: "v1"
      }
    });
  });
});
