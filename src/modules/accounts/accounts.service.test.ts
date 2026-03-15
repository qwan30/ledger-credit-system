import { describe, expect, it, vi } from "vitest";

import { AppException } from "@/common/errors/app-exception";
import { AccountsService } from "@/modules/accounts/accounts.service";

describe("AccountsService", () => {
  const context = {
    correlationId: "corr-1",
    actor: {
      actorId: "customer-1",
      actorType: "CUSTOMER" as const,
      roles: ["CUSTOMER"]
    }
  };

  it("returns the current balance and writes an audit record", async () => {
    const record = vi.fn().mockResolvedValue(undefined);
    const service = new AccountsService(
      {
        account: {
          findUnique: vi.fn().mockResolvedValue({
            id: "account-1",
            customerId: "customer-1",
            currency: "USD",
            status: "ACTIVE",
            balanceProjection: {
              currentMinor: 12_500n
            }
          })
        }
      } as never,
      {
        record
      } as never
    );

    await expect(service.getBalance("account-1", context)).resolves.toEqual({
      accountId: "account-1",
      amount: {
        currency: "USD",
        minorUnits: 12_500
      },
      status: "ACTIVE"
    });
    expect(record).toHaveBeenCalled();
  });

  it("rejects unknown accounts", async () => {
    const service = new AccountsService(
      {
        account: {
          findUnique: vi.fn().mockResolvedValue(null)
        }
      } as never,
      {
        record: vi.fn()
      } as never
    );

    await expect(service.getBalance("missing", context)).rejects.toBeInstanceOf(AppException);
  });

  it("returns paginated ledger entries", async () => {
    const service = new AccountsService(
      {
        account: {
          findUnique: vi.fn().mockResolvedValue({
            id: "account-1",
            customerId: "customer-1"
          })
        },
        accountStatementProjection: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: "line-2",
              accountId: "account-1",
              journalEntryId: "journal-2",
              postingId: "posting-2",
              effectiveAt: new Date("2026-03-15T00:00:00.000Z"),
              amountMinor: 200n,
              currency: "USD",
              direction: "CREDIT",
              runningBalanceMinor: 1_200n,
              journalEntry: {
                sourceOperationType: "INTERNAL_TRANSFER"
              }
            },
            {
              id: "line-1",
              accountId: "account-1",
              journalEntryId: "journal-1",
              postingId: "posting-1",
              effectiveAt: new Date("2026-03-14T00:00:00.000Z"),
              amountMinor: 100n,
              currency: "USD",
              direction: "DEBIT",
              runningBalanceMinor: 1_000n,
              journalEntry: {
                sourceOperationType: "END_OF_DAY_INTEREST"
              }
            }
          ])
        }
      } as never,
      {
        record: vi.fn().mockResolvedValue(undefined)
      } as never
    );

    const result = await service.getLedgerEntries("account-1", context, undefined, 1);

    expect(result.items).toHaveLength(1);
    expect(result.nextCursor).toBeDefined();
  });

  it("requires a linked ledger account for transfer reads", async () => {
    const service = new AccountsService(
      {
        account: {
          findUnique: vi.fn().mockResolvedValue({
            id: "account-1",
            customerId: "customer-1",
            ledgerAccount: null
          })
        }
      } as never,
      {
        record: vi.fn()
      } as never
    );

    await expect(service.getAccountForTransfer("account-1")).rejects.toBeInstanceOf(AppException);
  });
});
