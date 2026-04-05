import { describe, expect, it, vi } from "vitest";

import { AppException } from "@/common/errors/app-exception";
import { BatchService } from "@/modules/batch/batch.service";

describe("BatchService", () => {
  it("registers the batch handler and schedule on module init", async () => {
    const registerHandler = vi.fn().mockResolvedValue(undefined);
    const schedule = vi.fn().mockResolvedValue(undefined);
    const service = new BatchService(
      {} as never,
      {
        registerHandler,
        schedule
      } as never,
      {
        closeWindowCron: "0 0 * * *",
        batchShardSize: 500,
        batchWorkerConcurrency: 4,
        interestRateBps: 250n
      } as never,
      {} as never,
      {} as never
    );

    await service.onModuleInit();

    expect(registerHandler).toHaveBeenCalled();
    expect(schedule).toHaveBeenCalledWith("end-of-day-interest-close.run", "0 0 * * *", {
      triggeredBy: "scheduler"
    });
  });

  it("creates and completes a batch run with deterministic shards", async () => {
    const record = vi.fn().mockResolvedValue(undefined);
    const prisma = {
      batchRun: {
        create: vi.fn().mockResolvedValue({
          id: "batch-1"
        }),
        update: vi.fn().mockResolvedValue(undefined)
      },
      account: {
        findMany: vi.fn().mockResolvedValue([
          { id: "account-1" },
          { id: "account-2" }
        ])
      },
      batchRunItem: {
        createMany: vi.fn().mockResolvedValue(undefined),
        count: vi.fn().mockResolvedValueOnce(2).mockResolvedValueOnce(2).mockResolvedValueOnce(0)
      }
    };
    const service = new BatchService(
      prisma as never,
      {} as never,
      {
        closeWindowCron: "0 0 * * *",
        batchShardSize: 1,
        batchWorkerConcurrency: 2,
        interestRateBps: 250n
      } as never,
      {} as never,
      {
        record
      } as never
    );
    const internalService = service as unknown as { processBatchItem: (batchRunId: string, accountId: string) => Promise<void> };
    vi.spyOn(internalService, "processBatchItem").mockResolvedValue(undefined);

    await expect(service.runBatch("scheduler")).resolves.toBe("batch-1");
    expect(prisma.batchRunItem.createMany).toHaveBeenCalledWith({
      data: [
        {
          batchRunId: "batch-1",
          resourceType: "account",
          resourceId: "account-1",
          shardKey: "0",
          status: "PENDING"
        },
        {
          batchRunId: "batch-1",
          resourceType: "account",
          resourceId: "account-2",
          shardKey: "1",
          status: "PENDING"
        }
      ]
    });
    expect(record).toHaveBeenCalled();
  });

  it("uses the batched write path for processable accounts before falling back to per-item processing", async () => {
    const journalEntryCreateMany = vi.fn().mockResolvedValue({ count: 2 });
    const postingCreateMany = vi.fn().mockResolvedValue({ count: 4 });
    const statementCreateMany = vi.fn().mockResolvedValue({ count: 2 });
    const executeRaw = vi.fn().mockResolvedValue(2);
    const updateMany = vi.fn().mockResolvedValue({ count: 2 });
    const prisma = {
      batchRun: {
        create: vi.fn().mockResolvedValue({
          id: "batch-bulk-1"
        }),
        update: vi.fn().mockResolvedValue(undefined)
      },
      account: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "account-1",
            currency: "USD",
            ledgerAccount: { id: "ledger-customer-1" },
            balanceProjection: { currentMinor: 100_000n }
          },
          {
            id: "account-2",
            currency: "USD",
            ledgerAccount: { id: "ledger-customer-2" },
            balanceProjection: { currentMinor: 100_500n }
          }
        ])
      },
      ledgerAccount: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "ledger-interest-revenue",
            category: "INTEREST_REVENUE",
            currency: "USD"
          }
        ])
      },
      batchRunItem: {
        createMany: vi.fn().mockResolvedValue(undefined),
        count: vi.fn().mockResolvedValueOnce(2).mockResolvedValueOnce(2).mockResolvedValueOnce(0)
      },
      $transaction: vi.fn((callback) =>
        callback({
          batchRunItem: {
            updateMany
          },
          journalEntry: {
            createMany: journalEntryCreateMany
          },
          posting: {
            createMany: postingCreateMany
          },
          accountStatementProjection: {
            createMany: statementCreateMany
          },
          $executeRaw: executeRaw
        })
      )
    };

    const service = new BatchService(
      prisma as never,
      {} as never,
      {
        closeWindowCron: "0 0 * * *",
        batchShardSize: 500,
        batchWorkerConcurrency: 2,
        interestRateBps: 250n
      } as never,
      {
        findSystemLedgerAccount: vi.fn()
      } as never,
      {
        record: vi.fn().mockResolvedValue(undefined)
      } as never
    );

    const internalService = service as unknown as { processBatchItem: (batchRunId: string, accountId: string) => Promise<void> };
    const processBatchItemSpy = vi.spyOn(internalService, "processBatchItem").mockResolvedValue(undefined);

    await service.runBatch("scheduler");

    expect(processBatchItemSpy).not.toHaveBeenCalled();
    expect(journalEntryCreateMany).toHaveBeenCalled();
    expect(postingCreateMany).toHaveBeenCalled();
    expect(statementCreateMany).toHaveBeenCalled();
    expect(executeRaw).toHaveBeenCalled();
    expect(updateMany).toHaveBeenCalledTimes(2);
  });

  it("returns persisted batch details and throws for unknown runs", async () => {
    const service = new BatchService(
      {
        batchRun: {
          findUnique: vi
            .fn()
            .mockResolvedValueOnce({
              id: "batch-1",
              batchType: "end-of-day-interest-close",
              status: "COMPLETED",
              scheduledFor: new Date("2026-03-15T00:00:00.000Z"),
              startedAt: new Date("2026-03-15T00:00:01.000Z"),
              completedAt: new Date("2026-03-15T00:00:02.000Z"),
              processedCount: 10,
              successCount: 10,
              failureCount: 0,
              failureSummary: null
            })
            .mockResolvedValueOnce(null)
        }
      } as never,
      {} as never,
      {
        closeWindowCron: "0 0 * * *",
        batchShardSize: 500,
        batchWorkerConcurrency: 4,
        interestRateBps: 250n
      } as never,
      {} as never,
      {} as never
    );

    await expect(service.getBatchRun("batch-1")).resolves.toMatchObject({
      batchRunId: "batch-1",
      status: "COMPLETED"
    });
    await expect(service.getBatchRun("missing")).rejects.toBeInstanceOf(AppException);
  });

  it("retries only failed items and records the operation", async () => {
    const prisma = {
      batchRunItem: {
        findMany: vi.fn().mockResolvedValue([
          { resourceId: "account-1" },
          { resourceId: "account-2" }
        ])
      }
    };
    const record = vi.fn().mockResolvedValue(undefined);
    const service = new BatchService(
      prisma as never,
      {} as never,
      {
        closeWindowCron: "0 0 * * *",
        batchShardSize: 500,
        batchWorkerConcurrency: 2,
        interestRateBps: 250n
      } as never,
      {} as never,
      {
        record
      } as never
    );
    const internalService = service as unknown as { processBatchItem: (batchRunId: string, accountId: string) => Promise<void> };
    vi.spyOn(internalService, "processBatchItem").mockResolvedValue(undefined);

    await expect(
      service.retryFailedItems("batch-1", {
        correlationId: "corr-1",
        actor: {
          actorId: "ops-1",
          actorType: "OPS",
          roles: ["OPS"]
        }
      })
    ).resolves.toEqual({
      retriedCount: 2
    });
    expect(record).toHaveBeenCalled();
  });

  it("processes batch items with the configured concurrency limit", async () => {
    const prisma = {
      batchRun: {
        create: vi.fn().mockResolvedValue({
          id: "batch-2"
        }),
        update: vi.fn().mockResolvedValue(undefined)
      },
      account: {
        findMany: vi.fn().mockResolvedValue(
          Array.from({ length: 5 }, (_, index) => ({
            id: `account-${index + 1}`
          }))
        )
      },
      batchRunItem: {
        createMany: vi.fn().mockResolvedValue(undefined),
        count: vi.fn().mockResolvedValueOnce(5).mockResolvedValueOnce(5).mockResolvedValueOnce(0)
      }
    };
    const service = new BatchService(
      prisma as never,
      {} as never,
      {
        closeWindowCron: "0 0 * * *",
        batchShardSize: 500,
        batchWorkerConcurrency: 2,
        interestRateBps: 250n
      } as never,
      {} as never,
      {
        record: vi.fn().mockResolvedValue(undefined)
      } as never
    );

    let inFlight = 0;
    let maxInFlight = 0;
    const internalService = service as unknown as { processBatchItem: (batchRunId: string, accountId: string) => Promise<void> };
    vi.spyOn(internalService, "processBatchItem").mockImplementation(async () => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
    });

    await service.runBatch("scheduler");

    expect(maxInFlight).toBe(2);
  });
});
