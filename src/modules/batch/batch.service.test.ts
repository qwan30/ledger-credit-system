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
});
