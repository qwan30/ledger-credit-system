import { Injectable, OnModuleInit } from "@nestjs/common";

import { AppConfigService } from "@/common/config/app-config.service";
import { AppException } from "@/common/errors/app-exception";
import { JobsService } from "@/common/jobs/jobs.service";
import { Money } from "@/common/money/money";
import type { RequestContext } from "@/common/http/request-context";
import { PrismaService } from "@/common/prisma/prisma.service";
import { AuditService } from "@/modules/audit/audit.service";
import { LedgerService } from "@/modules/ledger/ledger.service";

interface BatchJobPayload {
  triggeredBy: string;
}

@Injectable()
export class BatchService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobsService: JobsService,
    private readonly config: AppConfigService,
    private readonly ledgerService: LedgerService,
    private readonly auditService: AuditService
  ) {}

  async onModuleInit(): Promise<void> {
    await this.jobsService.registerHandler<BatchJobPayload>("end-of-day-interest-close.run", async (payload) => {
      await this.runBatch(payload.triggeredBy);
    });
    await this.jobsService.schedule("end-of-day-interest-close.run", this.config.closeWindowCron, {
      triggeredBy: "scheduler"
    });
  }

  async runBatch(triggeredBy: string): Promise<string> {
    const correlationId = crypto.randomUUID();
    const batchRun = await this.prisma.batchRun.create({
      data: {
        batchType: "end-of-day-interest-close",
        status: "RUNNING",
        scheduledFor: new Date(),
        startedAt: new Date(),
        correlationId
      }
    });

    const accounts = await this.prisma.account.findMany({
      where: {
        status: "ACTIVE"
      },
      orderBy: {
        id: "asc"
      }
    });

    await this.prisma.batchRunItem.createMany({
      data: accounts.map((account, index) => ({
        batchRunId: batchRun.id,
        resourceType: "account",
        resourceId: account.id,
        shardKey: String(Math.floor(index / Math.max(1, this.config.batchShardSize))),
        status: "PENDING"
      }))
    });

    for (const account of accounts) {
      await this.processBatchItem(batchRun.id, account.id);
    }

    const [processedCount, successCount, failureCount] = await Promise.all([
      this.prisma.batchRunItem.count({
        where: { batchRunId: batchRun.id }
      }),
      this.prisma.batchRunItem.count({
        where: {
          batchRunId: batchRun.id,
          status: "COMPLETED"
        }
      }),
      this.prisma.batchRunItem.count({
        where: {
          batchRunId: batchRun.id,
          status: "FAILED"
        }
      })
    ]);

    const finalStatus =
      failureCount === 0 ? "COMPLETED" : successCount > 0 ? "PARTIALLY_FAILED" : "FAILED";
    await this.prisma.batchRun.update({
      where: { id: batchRun.id },
      data: {
        status: finalStatus,
        completedAt: new Date(),
        processedCount,
        successCount,
        failureCount,
        ...(failureCount > 0
          ? {
              failureSummary: {
                failedItems: failureCount
              }
            }
          : {})
      }
    });

    await this.auditService.record(
      {
        correlationId,
        actor: {
          actorId: triggeredBy,
          actorType: "SYSTEM",
          roles: []
        }
      },
      {
        actionType: "batch.completed",
        resourceType: "batch_run",
        resourceId: batchRun.id,
        metadata: {
          status: finalStatus
        }
      }
    );

    return batchRun.id;
  }

  async getBatchRun(batchRunId: string) {
    const batchRun = await this.prisma.batchRun.findUnique({
      where: { id: batchRunId }
    });

    if (!batchRun) {
      throw new AppException(404, "batch_run_not_found", "Batch run was not found.");
    }

    return {
      batchRunId: batchRun.id,
      batchType: batchRun.batchType,
      status: batchRun.status,
      scheduledFor: batchRun.scheduledFor.toISOString(),
      startedAt: batchRun.startedAt?.toISOString(),
      completedAt: batchRun.completedAt?.toISOString(),
      processedCount: batchRun.processedCount,
      successCount: batchRun.successCount,
      failureCount: batchRun.failureCount,
      failureSummary: batchRun.failureSummary
    };
  }

  async retryFailedItems(batchRunId: string, context: RequestContext) {
    const failedItems = await this.prisma.batchRunItem.findMany({
      where: {
        batchRunId,
        status: "FAILED"
      }
    });

    if (failedItems.length === 0) {
      return {
        retriedCount: 0
      };
    }

    for (const item of failedItems) {
      await this.processBatchItem(batchRunId, item.resourceId);
    }

    await this.auditService.record(context, {
      actionType: "batch.retry_requested",
      resourceType: "batch_run",
      resourceId: batchRunId,
      metadata: {
        retriedCount: failedItems.length
      }
    });

    return {
      retriedCount: failedItems.length
    };
  }

  private async processBatchItem(batchRunId: string, accountId: string): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const batchItem = await tx.batchRunItem.findUnique({
          where: {
            batchRunId_resourceType_resourceId: {
              batchRunId,
              resourceType: "account",
              resourceId: accountId
            }
          }
        });

        if (!batchItem || batchItem.status === "COMPLETED") {
          return;
        }

        const account = await tx.account.findUnique({
          where: { id: accountId },
          include: {
            ledgerAccount: true,
            balanceProjection: true
          }
        });

        if (!account?.ledgerAccount) {
          throw new AppException(404, "account_not_found", "Batch item account was not found.");
        }

        await tx.batchRunItem.update({
          where: { id: batchItem.id },
          data: {
            status: "RUNNING",
            attemptCount: {
              increment: 1
            }
          }
        });

        const balanceMinor = account.balanceProjection?.currentMinor ?? 0n;
        const interestMinor = (balanceMinor * this.config.interestRateBps) / 10_000n / 365n;

        if (interestMinor > 0n) {
          const interestRevenueAccount = await this.ledgerService.findSystemLedgerAccount(
            tx,
            "INTEREST_REVENUE",
            account.currency
          );

          await this.ledgerService.postJournalEntry(tx, {
            batchRunId,
            effectiveAt: new Date(),
            sourceOperationType: "END_OF_DAY_INTEREST",
            description: `Interest accrual for account ${account.id}`,
            correlationId: batchRunId,
            postings: [
              {
                ledgerAccountId: interestRevenueAccount.id,
                direction: "DEBIT",
                amount: Money.fromMinorUnits(account.currency, interestMinor)
              },
              {
                ledgerAccountId: account.ledgerAccount.id,
                direction: "CREDIT",
                amount: Money.fromMinorUnits(account.currency, interestMinor)
              }
            ]
          });
        }

        await tx.batchRunItem.update({
          where: { id: batchItem.id },
          data: {
            status: "COMPLETED",
            lastError: null
          }
        });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown batch processing failure.";

      await this.prisma.batchRunItem.update({
        where: {
          batchRunId_resourceType_resourceId: {
            batchRunId,
            resourceType: "account",
            resourceId: accountId
          }
        },
        data: {
          status: "FAILED",
          lastError: message
        }
      });
    }
  }
}
