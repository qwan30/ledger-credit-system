import { Inject, Injectable } from "@nestjs/common";

import { assertCustomerOwnsResource } from "@/common/auth/authorization";
import { AppException } from "@/common/errors/app-exception";
import type { RequestContext } from "@/common/http/request-context";
import { decodeCursor, encodeCursor } from "@/common/pagination/cursor";
import { PrismaService } from "@/common/prisma/prisma.service";
import { AuditService } from "@/modules/audit/audit.service";

@Injectable()
export class AccountsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly auditService: AuditService
  ) {}

  async getBalance(accountId: string, context: RequestContext) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: {
        customer: true,
        balanceProjection: true
      }
    });

    if (!account) {
      throw new AppException(404, "account_not_found", "Account was not found.");
    }

    assertCustomerOwnsResource(context, account.customerId);

    await this.auditService.record(context, {
      actionType: "account.balance_viewed",
      resourceType: "account",
      resourceId: account.id
    });

    return {
      accountId: account.id,
      amount: {
        currency: account.currency,
        minorUnits: Number(account.balanceProjection?.currentMinor ?? 0n)
      },
      status: account.status
    };
  }

  async getLedgerEntries(accountId: string, context: RequestContext, cursor?: string, limit = 20) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      throw new AppException(404, "account_not_found", "Account was not found.");
    }

    assertCustomerOwnsResource(context, account.customerId);

    const decodedCursor = decodeCursor(cursor);
    const statementLines = await this.prisma.accountStatementProjection.findMany({
      where: {
        accountId,
        ...(decodedCursor
          ? {
              OR: [
                {
                  effectiveAt: {
                    lt: new Date(decodedCursor.effectiveAt)
                  }
                },
                {
                  effectiveAt: new Date(decodedCursor.effectiveAt),
                  id: {
                    lt: decodedCursor.id
                  }
                }
              ]
            }
          : {})
      },
      include: {
        journalEntry: true
      },
      orderBy: [{ effectiveAt: "desc" }, { id: "desc" }],
      take: Math.min(limit, 100) + 1
    });

    await this.auditService.record(context, {
      actionType: "account.ledger_entries_viewed",
      resourceType: "account",
      resourceId: accountId
    });

    const hasMore = statementLines.length > limit;
    const items = statementLines.slice(0, limit).map((line) => ({
      accountId: line.accountId,
      journalEntryId: line.journalEntryId,
      postingId: line.postingId,
      effectiveAt: line.effectiveAt.toISOString(),
      amount: {
        currency: line.currency,
        minorUnits: Number(line.amountMinor)
      },
      direction: line.direction,
      runningBalanceMinor: Number(line.runningBalanceMinor),
      sourceOperationType: line.journalEntry.sourceOperationType
    }));
    const next = hasMore ? statementLines[limit] : undefined;

    return {
      items,
      nextCursor: next
        ? encodeCursor({
            effectiveAt: next.effectiveAt.toISOString(),
            id: next.id
          })
        : undefined
    };
  }

  async getAccountForTransfer(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: {
        ledgerAccount: true,
        balanceProjection: true
      }
    });

    if (!account) {
      throw new AppException(404, "account_not_found", "Account was not found.");
    }

    if (!account.ledgerAccount) {
      throw new AppException(500, "ledger_account_missing", "Account is missing a linked ledger account.");
    }

    return account;
  }
}
