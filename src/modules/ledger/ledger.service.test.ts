import { describe, expect, it, vi } from "vitest";

import { AppException } from "@/common/errors/app-exception";
import { Money } from "@/common/money/money";
import { LedgerService } from "@/modules/ledger/ledger.service";

describe("LedgerService", () => {
  it("rejects unbalanced journal entries", async () => {
    const service = new LedgerService();

    await expect(
      service.postJournalEntry(
        {
          ledgerAccount: {
            findMany: vi.fn()
          }
        } as never,
        {
          effectiveAt: new Date(),
          sourceOperationType: "TEST",
          postings: [
            {
              ledgerAccountId: "ledger-a",
              direction: "DEBIT",
              amount: Money.fromMinorUnits("USD", 200)
            },
            {
              ledgerAccountId: "ledger-b",
              direction: "CREDIT",
              amount: Money.fromMinorUnits("USD", 100)
            }
          ]
        }
      )
    ).rejects.toBeInstanceOf(AppException);
  });

  it("creates postings and projections for balanced journal entries", async () => {
    const tx = {
      ledgerAccount: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "ledger-a",
            accountId: "account-a",
            normalBalanceDirection: "DEBIT"
          },
          {
            id: "ledger-b",
            accountId: "account-b",
            normalBalanceDirection: "CREDIT"
          }
        ])
      },
      journalEntry: {
        create: vi.fn().mockResolvedValue({
          id: "journal-1",
          effectiveAt: new Date("2026-03-15T00:00:00.000Z")
        })
      },
      posting: {
        create: vi
          .fn()
          .mockResolvedValueOnce({
            id: "posting-1",
            ledgerAccountId: "ledger-a",
            amountMinor: 100n,
            currency: "USD",
            direction: "DEBIT"
          })
          .mockResolvedValueOnce({
            id: "posting-2",
            ledgerAccountId: "ledger-b",
            amountMinor: 100n,
            currency: "USD",
            direction: "CREDIT"
          })
      },
      balanceProjection: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue(undefined)
      },
      accountStatementProjection: {
        create: vi.fn().mockResolvedValue(undefined)
      }
    };
    const service = new LedgerService();

    const result = await service.postJournalEntry(tx as never, {
      effectiveAt: new Date("2026-03-15T00:00:00.000Z"),
      sourceOperationType: "TEST",
      postings: [
        {
          ledgerAccountId: "ledger-a",
          direction: "DEBIT",
          amount: Money.fromMinorUnits("USD", 100)
        },
        {
          ledgerAccountId: "ledger-b",
          direction: "CREDIT",
          amount: Money.fromMinorUnits("USD", 100)
        }
      ]
    });

    expect(result.postings).toHaveLength(2);
    expect(tx.balanceProjection.upsert).toHaveBeenCalledTimes(2);
    expect(tx.accountStatementProjection.create).toHaveBeenCalledTimes(2);
  });

  it("fails when the requested system ledger account does not exist", async () => {
    const service = new LedgerService();

    await expect(
      service.findSystemLedgerAccount(
        {
          ledgerAccount: {
            findFirst: vi.fn().mockResolvedValue(null)
          }
        } as never,
        "CLEARING",
        "USD"
      )
    ).rejects.toBeInstanceOf(AppException);
  });
});
