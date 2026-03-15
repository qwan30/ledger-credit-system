import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { AppException } from "@/common/errors/app-exception";
import { Money } from "@/common/money/money";

type PostingDirection = "DEBIT" | "CREDIT";
type NormalBalanceDirection = "DEBIT" | "CREDIT";

export interface LedgerPostingInput {
  ledgerAccountId: string;
  direction: PostingDirection;
  amount: Money;
}

export interface PostJournalEntryInput {
  transferRequestId?: string | undefined;
  batchRunId?: string | undefined;
  effectiveAt: Date;
  sourceOperationType: string;
  description?: string | undefined;
  correlationId?: string | undefined;
  idempotencyKey?: string | undefined;
  postings: LedgerPostingInput[];
}

@Injectable()
export class LedgerService {
  async postJournalEntry(tx: Prisma.TransactionClient, input: PostJournalEntryInput) {
    if (input.postings.length < 2) {
      throw new AppException(422, "invalid_postings", "A journal entry must contain at least two postings.");
    }

    const currency = input.postings[0]?.amount.currency;
    const debitTotal = input.postings
      .filter((posting) => posting.direction === "DEBIT")
      .reduce((sum, posting) => sum + posting.amount.minorUnits, 0n);
    const creditTotal = input.postings
      .filter((posting) => posting.direction === "CREDIT")
      .reduce((sum, posting) => sum + posting.amount.minorUnits, 0n);

    if (debitTotal !== creditTotal) {
      throw new AppException(422, "unbalanced_journal_entry", "Debit and credit totals must match exactly.");
    }

    if (!input.postings.every((posting) => posting.amount.currency === currency)) {
      throw new AppException(422, "currency_mismatch", "All postings in a journal entry must share the same currency.");
    }

    const ledgerAccounts = await tx.ledgerAccount.findMany({
      where: {
        id: {
          in: input.postings.map((posting) => posting.ledgerAccountId)
        }
      }
    });
    const ledgerAccountMap = new Map(ledgerAccounts.map((ledgerAccount) => [ledgerAccount.id, ledgerAccount]));

    if (ledgerAccounts.length !== input.postings.length) {
      throw new AppException(422, "missing_ledger_account", "At least one ledger account does not exist.");
    }

    const journalEntry = await tx.journalEntry.create({
      data: {
        effectiveAt: input.effectiveAt,
        sourceOperationType: input.sourceOperationType,
        ...(input.transferRequestId ? { transferRequestId: input.transferRequestId } : {}),
        ...(input.batchRunId ? { batchRunId: input.batchRunId } : {}),
        ...(input.correlationId ? { correlationId: input.correlationId } : {}),
        ...(input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : {}),
        ...(input.description ? { description: input.description } : {})
      }
    });

    const postings = [];

    for (const postingInput of input.postings) {
      const posting = await tx.posting.create({
        data: {
          journalEntryId: journalEntry.id,
          ledgerAccountId: postingInput.ledgerAccountId,
          amountMinor: postingInput.amount.minorUnits,
          currency: postingInput.amount.currency,
          direction: postingInput.direction
        }
      });

      postings.push(posting);

      const ledgerAccount = ledgerAccountMap.get(posting.ledgerAccountId);
      if (!ledgerAccount?.accountId) {
        continue;
      }

      const existingProjection = await tx.balanceProjection.findUnique({
        where: { accountId: ledgerAccount.accountId }
      });

      const effect = this.computeBalanceEffect(
        posting.direction,
        ledgerAccount.normalBalanceDirection as NormalBalanceDirection,
        posting.amountMinor
      );
      const runningBalance = (existingProjection?.currentMinor ?? 0n) + effect;

      await tx.balanceProjection.upsert({
        where: {
          accountId: ledgerAccount.accountId
        },
        update: {
          currentMinor: runningBalance,
          currency: posting.currency,
          journalEntryId: journalEntry.id
        },
        create: {
          accountId: ledgerAccount.accountId,
          currentMinor: runningBalance,
          currency: posting.currency,
          journalEntryId: journalEntry.id
        }
      });

      await tx.accountStatementProjection.create({
        data: {
          accountId: ledgerAccount.accountId,
          journalEntryId: journalEntry.id,
          postingId: posting.id,
          effectiveAt: journalEntry.effectiveAt,
          amountMinor: posting.amountMinor,
          currency: posting.currency,
          direction: posting.direction,
          runningBalanceMinor: runningBalance
        }
      });
    }

    return {
      journalEntry,
      postings
    };
  }

  async findSystemLedgerAccount(tx: Prisma.TransactionClient, category: string, currency: string) {
    const ledgerAccount = await tx.ledgerAccount.findFirst({
      where: {
        category: category as never,
        currency
      }
    });

    if (!ledgerAccount) {
      throw new AppException(500, "system_ledger_account_missing", `Missing system ledger account for ${category}/${currency}.`);
    }

    return ledgerAccount;
  }

  private computeBalanceEffect(
    postingDirection: PostingDirection,
    normalBalanceDirection: NormalBalanceDirection,
    amountMinor: bigint
  ): bigint {
    return postingDirection === normalBalanceDirection ? amountMinor : -amountMinor;
  }
}
