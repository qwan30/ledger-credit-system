import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Prisma } from "@prisma/client";

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

interface BatchAccountSnapshot {
  id: string;
  currency: string;
  ledgerAccount: {
    id: string;
  } | null;
  balanceProjection: {
    currentMinor: bigint;
  } | null;
}

interface BalanceProjectionUpsertRow {
  accountId: string;
  currency: string;
  currentMinor: bigint;
  journalEntryId: string;
}

@Injectable()
export class BatchService implements OnModuleInit {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JobsService) private readonly jobsService: JobsService,
    @Inject(AppConfigService) private readonly config: AppConfigService,
    @Inject(LedgerService) private readonly ledgerService: LedgerService,
    @Inject(AuditService) private readonly auditService: AuditService
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
      select: {
        id: true,
        currency: true,
        ledgerAccount: {
          select: {
            id: true
          }
        },
        balanceProjection: {
          select: {
            currentMinor: true
          }
        }
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

    await this.processBatchRunAccounts(batchRun.id, accounts);

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

    await this.processBatchItems(
      batchRunId,
      failedItems.map((item) => item.resourceId)
    );

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

  private async processBatchRunAccounts(batchRunId: string, accounts: BatchAccountSnapshot[]): Promise<void> {
    const processableAccounts = accounts.filter((account) => account.ledgerAccount);
    const fallbackAccountIds = accounts
      .filter((account) => !account.ledgerAccount)
      .map((account) => account.id);

    if (fallbackAccountIds.length > 0) {
      await this.processBatchItems(batchRunId, fallbackAccountIds);
    }

    if (processableAccounts.length === 0) {
      return;
    }

    const interestRevenueAccountIds = await this.loadInterestRevenueAccounts(
      processableAccounts.map((account) => account.currency)
    );
    const chunkSize = Math.max(1, this.config.batchShardSize);

    for (let offset = 0; offset < processableAccounts.length; offset += chunkSize) {
      const chunk = processableAccounts.slice(offset, offset + chunkSize);

      try {
        await this.processBatchChunk(batchRunId, chunk, interestRevenueAccountIds);
      } catch {
        await this.processBatchItems(
          batchRunId,
          chunk.map((account) => account.id)
        );
      }
    }
  }

  private async loadInterestRevenueAccounts(currencies: string[]): Promise<Map<string, string>> {
    const uniqueCurrencies = [...new Set(currencies)];
    const ledgerAccounts = await this.prisma.ledgerAccount.findMany({
      where: {
        category: "INTEREST_REVENUE",
        currency: {
          in: uniqueCurrencies
        }
      },
      select: {
        id: true,
        currency: true
      }
    });

    const accountIdsByCurrency = new Map(ledgerAccounts.map((ledgerAccount) => [ledgerAccount.currency, ledgerAccount.id]));
    for (const currency of uniqueCurrencies) {
      if (!accountIdsByCurrency.has(currency)) {
        throw new AppException(
          500,
          "system_ledger_account_missing",
          `Missing system ledger account for INTEREST_REVENUE/${currency}.`
        );
      }
    }

    return accountIdsByCurrency;
  }

  private async processBatchChunk(
    batchRunId: string,
    accounts: BatchAccountSnapshot[],
    interestRevenueAccountIds: Map<string, string>
  ): Promise<void> {
    const effectiveAt = new Date();
    const accountIds = accounts.map((account) => account.id);
    const journalEntries: Array<Prisma.JournalEntryCreateManyInput> = [];
    const postings: Array<Prisma.PostingCreateManyInput> = [];
    const statementLines: Array<Prisma.AccountStatementProjectionCreateManyInput> = [];
    const balanceRows: BalanceProjectionUpsertRow[] = [];

    for (const account of accounts) {
      if (!account.ledgerAccount) {
        throw new AppException(404, "account_not_found", "Batch item account was not found.");
      }

      const interestRevenueAccountId = interestRevenueAccountIds.get(account.currency);
      if (!interestRevenueAccountId) {
        throw new AppException(
          500,
          "system_ledger_account_missing",
          `Missing system ledger account for INTEREST_REVENUE/${account.currency}.`
        );
      }

      const balanceMinor = account.balanceProjection?.currentMinor ?? 0n;
      const interestMinor = (balanceMinor * this.config.interestRateBps) / 10_000n / 365n;

      if (interestMinor <= 0n) {
        continue;
      }

      const journalEntryId = crypto.randomUUID();
      const debitPostingId = crypto.randomUUID();
      const creditPostingId = crypto.randomUUID();
      const runningBalanceMinor = balanceMinor + interestMinor;

      journalEntries.push({
        id: journalEntryId,
        batchRunId,
        effectiveAt,
        sourceOperationType: "END_OF_DAY_INTEREST",
        description: `Interest accrual for account ${account.id}`,
        correlationId: batchRunId
      });
      postings.push(
        {
          id: debitPostingId,
          journalEntryId,
          ledgerAccountId: interestRevenueAccountId,
          amountMinor: interestMinor,
          currency: account.currency,
          direction: "DEBIT"
        },
        {
          id: creditPostingId,
          journalEntryId,
          ledgerAccountId: account.ledgerAccount.id,
          amountMinor: interestMinor,
          currency: account.currency,
          direction: "CREDIT"
        }
      );
      statementLines.push({
        id: crypto.randomUUID(),
        accountId: account.id,
        journalEntryId,
        postingId: creditPostingId,
        effectiveAt,
        amountMinor: interestMinor,
        currency: account.currency,
        direction: "CREDIT",
        runningBalanceMinor
      });
      balanceRows.push({
        accountId: account.id,
        currency: account.currency,
        currentMinor: runningBalanceMinor,
        journalEntryId
      });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.batchRunItem.updateMany({
        where: {
          batchRunId,
          resourceType: "account",
          resourceId: {
            in: accountIds
          }
        },
        data: {
          status: "RUNNING",
          attemptCount: {
            increment: 1
          }
        }
      });

      if (journalEntries.length > 0) {
        await tx.journalEntry.createMany({
          data: journalEntries
        });
        await tx.posting.createMany({
          data: postings
        });
        await tx.accountStatementProjection.createMany({
          data: statementLines
        });
        await this.upsertBalanceProjectionRows(tx, balanceRows);
      }

      await tx.batchRunItem.updateMany({
        where: {
          batchRunId,
          resourceType: "account",
          resourceId: {
            in: accountIds
          }
        },
        data: {
          status: "COMPLETED",
          lastError: null
        }
      });
    });
  }

  private async upsertBalanceProjectionRows(
    tx: Prisma.TransactionClient,
    rows: BalanceProjectionUpsertRow[]
  ): Promise<void> {
    if (rows.length === 0) {
      return;
    }

    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "balance_projection" ("accountId", "currency", "currentMinor", "journalEntryId", "updatedAt")
      VALUES ${Prisma.join(
        rows.map(
          (row) =>
            Prisma.sql`(${row.accountId}::uuid, ${row.currency}, ${row.currentMinor}::bigint, ${row.journalEntryId}::uuid, NOW())`
        )
      )}
      ON CONFLICT ("accountId")
      DO UPDATE SET
        "currency" = EXCLUDED."currency",
        "currentMinor" = EXCLUDED."currentMinor",
        "journalEntryId" = EXCLUDED."journalEntryId",
        "updatedAt" = NOW()
    `);
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

  private async processBatchItems(batchRunId: string, accountIds: string[]): Promise<void> {
    if (accountIds.length === 0) {
      return;
    }

    const workerCount = Math.min(this.getWorkerConcurrency(), accountIds.length);
    let nextIndex = 0;

    await Promise.all(
      Array.from({ length: workerCount }, async () => {
        while (nextIndex < accountIds.length) {
          const accountId = accountIds[nextIndex];
          nextIndex += 1;

          if (!accountId) {
            return;
          }

          await this.processBatchItem(batchRunId, accountId);
        }
      })
    );
  }

  private getWorkerConcurrency(): number {
    const configuredConcurrency = Number(this.config.batchWorkerConcurrency ?? 1);

    if (!Number.isFinite(configuredConcurrency) || configuredConcurrency < 1) {
      return 1;
    }

    return Math.floor(configuredConcurrency);
  }
}
