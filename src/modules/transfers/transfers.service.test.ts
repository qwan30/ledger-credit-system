import { describe, expect, it, vi } from "vitest";

import { AppException } from "@/common/errors/app-exception";
import { TransfersService } from "@/modules/transfers/transfers.service";

describe("TransfersService", () => {
  const context = {
    correlationId: "corr-1",
    idempotencyKey: "idem-1",
    actor: {
      actorId: "customer-1",
      actorType: "CUSTOMER" as const,
      roles: ["CUSTOMER"]
    }
  };

  it("creates an internal transfer synchronously", async () => {
    const tx = {
      account: {
        findUnique: vi
          .fn()
          .mockResolvedValueOnce({
            id: "account-source",
            customerId: "customer-1",
            status: "ACTIVE",
            currency: "USD",
            ledgerAccount: { id: "ledger-source" },
            balanceProjection: { currentMinor: 10_000n }
          })
          .mockResolvedValueOnce({
            id: "account-destination",
            currency: "USD",
            ledgerAccount: { id: "ledger-destination" }
          })
      },
      transferRequest: {
        create: vi.fn().mockResolvedValue({
          id: "transfer-1"
        }),
        update: vi
          .fn()
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce({
            id: "transfer-1",
            status: "SETTLED",
            correlationId: "corr-1"
          })
      }
    } as never;
    const ledgerPost = vi.fn().mockResolvedValue(undefined);
    const complete = vi.fn().mockResolvedValue(undefined);
    const recordInTransaction = vi.fn().mockResolvedValue(undefined);
    const service = new TransfersService(
      {
        $transaction: vi.fn((callback) => callback(tx))
      } as never,
      {
        supportedCurrencies: ["USD"]
      } as never,
      {
        postJournalEntry: ledgerPost
      } as never,
      {
        recordInTransaction
      } as never,
      {
        begin: vi.fn().mockResolvedValue({ recordId: "idem-record-1" }),
        complete
      } as never,
      {
        get: vi.fn()
      } as never,
      {
        enqueueTransferSubmission: vi.fn()
      } as never
    );

    const result = await service.createTransfer(
      {
        sourceAccountId: "account-source",
        destination: {
          type: "INTERNAL_ACCOUNT",
          accountId: "account-destination"
        },
        amount: {
          currency: "USD",
          minorUnits: 5000
        }
      },
      context
    );

    expect(ledgerPost).toHaveBeenCalled();
    expect(complete).toHaveBeenCalled();
    expect(recordInTransaction).toHaveBeenCalled();
    expect(result).toEqual({
      statusCode: 200,
      body: {
        data: {
          transferRequestId: "transfer-1",
          status: "SETTLED",
          correlationId: "corr-1"
        }
      }
    });
  });

  it("creates an external transfer and enqueues async settlement", async () => {
    const publish = vi.fn().mockResolvedValue(undefined);
    const transferUpdate = vi.fn().mockResolvedValue({});
    const tx = {
      account: {
        findUnique: vi.fn().mockResolvedValue({
          id: "account-source",
          customerId: "customer-1",
          status: "ACTIVE",
          currency: "USD",
          ledgerAccount: { id: "ledger-source" },
          balanceProjection: { currentMinor: 10_000n }
        })
      },
      transferRequest: {
        create: vi.fn().mockResolvedValue({
          id: "transfer-2"
        }),
        update: transferUpdate
      },
      externalTransferEvent: {
        create: vi.fn().mockResolvedValue(undefined)
      }
    } as never;
    const registryGet = vi.fn().mockReturnValue({
      provider: "mock-bank"
    });
    const service = new TransfersService(
      {
        $transaction: vi.fn((callback) => callback(tx))
      } as never,
      {
        supportedCurrencies: ["USD"]
      } as never,
      {
        postJournalEntry: vi.fn().mockResolvedValue(undefined),
        findSystemLedgerAccount: vi.fn().mockResolvedValue({ id: "ledger-clearing" })
      } as never,
      {
        recordInTransaction: vi.fn().mockResolvedValue(undefined)
      } as never,
      {
        begin: vi.fn().mockResolvedValue({ recordId: "idem-record-2" }),
        complete: vi.fn().mockResolvedValue(undefined)
      } as never,
      {
        get: registryGet
      } as never,
      {
        enqueueTransferSubmission: publish
      } as never
    );

    const result = await service.createTransfer(
      {
        sourceAccountId: "account-source",
        destination: {
          type: "EXTERNAL_BANK",
          provider: "mock-bank",
          bankCode: "VCB",
          accountNumber: "12345678",
          accountName: "Receiver"
        },
        amount: {
          currency: "USD",
          minorUnits: 2500
        }
      },
      context
    );

    expect(registryGet).toHaveBeenCalledWith("mock-bank");
    expect(transferUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "transfer-2" },
        data: expect.objectContaining({
          externalRailProvider: "mock-bank"
        })
      })
    );
    expect(publish).toHaveBeenCalledWith("transfer-2");
    expect(result).toEqual({
      statusCode: 202,
      body: {
        data: {
          transferRequestId: "transfer-2",
          status: "PENDING_EXTERNAL",
          correlationId: "corr-1"
        }
      }
    });
  });

  it("replays an idempotent transfer result", async () => {
    const service = new TransfersService(
      {
        $transaction: vi.fn((callback) => callback({}))
      } as never,
      {
        supportedCurrencies: ["USD"]
      } as never,
      {} as never,
      {} as never,
      {
        begin: vi.fn().mockResolvedValue({
          replay: {
            statusCode: 200,
            body: {
              data: {
                transferRequestId: "transfer-1"
              }
            }
          }
        })
      } as never,
      {
        get: vi.fn()
      } as never,
      {
        enqueueTransferSubmission: vi.fn()
      } as never
    );

    await expect(
      service.createTransfer(
        {
          sourceAccountId: "account-source",
          destination: {
            type: "INTERNAL_ACCOUNT",
            accountId: "account-destination"
          },
          amount: {
            currency: "USD",
            minorUnits: 500
          }
        },
        context
      )
    ).resolves.toEqual({
      statusCode: 200,
      body: {
        data: {
          transferRequestId: "transfer-1"
        }
      }
    });
  });

  it("rejects transfers without idempotency", async () => {
    const service = new TransfersService(
      {} as never,
      {
        supportedCurrencies: ["USD"]
      } as never,
      {} as never,
      {} as never,
      {} as never,
      {
        get: vi.fn()
      } as never,
      {} as never
    );

    await expect(
      service.createTransfer(
        {
          sourceAccountId: "account-source",
          destination: {
            type: "INTERNAL_ACCOUNT",
            accountId: "account-destination"
          },
          amount: {
            currency: "USD",
            minorUnits: 500
          }
        },
        {
          correlationId: "corr-1",
          actor: context.actor
        }
      )
    ).rejects.toBeInstanceOf(AppException);
  });

  it("returns mapped transfer details", async () => {
    const service = new TransfersService(
      {
        transferRequest: {
          findUnique: vi.fn().mockResolvedValue({
            id: "transfer-1",
            transferType: "INTERNAL",
            status: "SETTLED",
            amountMinor: 5000n,
            currency: "USD",
            sourceAccountId: "account-source",
            destinationAccountId: "account-destination",
            destinationExternalBankCode: null,
            destinationExternalAccountNumber: null,
            destinationExternalAccountName: null,
            externalReference: null,
            failureReason: null,
            createdAt: new Date("2026-03-15T00:00:00.000Z"),
            settledAt: new Date("2026-03-15T01:00:00.000Z"),
            sourceAccount: {
              customerId: "customer-1"
            },
            destinationAccount: {}
          })
        }
      } as never,
      {
        supportedCurrencies: ["USD"]
      } as never,
      {} as never,
      {} as never,
      {} as never,
      {
        get: vi.fn()
      } as never,
      {} as never
    );

    await expect(service.getTransferById("transfer-1", context)).resolves.toMatchObject({
      transferRequestId: "transfer-1",
      status: "SETTLED",
      destination: {
        type: "INTERNAL_ACCOUNT",
        accountId: "account-destination"
      }
    });
  });

  it("rejects unsupported external rail providers before persisting the transfer", async () => {
    const service = new TransfersService(
      {
        $transaction: vi.fn()
      } as never,
      {
        supportedCurrencies: ["USD"]
      } as never,
      {} as never,
      {} as never,
      {} as never,
      {
        get: vi.fn(() => {
          throw new AppException(422, "external_rail_provider_not_supported", "Unsupported provider.");
        })
      } as never,
      {} as never
    );

    await expect(
      service.createTransfer(
        {
          sourceAccountId: "account-source",
          destination: {
            type: "EXTERNAL_BANK",
            provider: "unsupported-bank",
            bankCode: "VCB",
            accountNumber: "12345678",
            accountName: "Receiver"
          },
          amount: {
            currency: "USD",
            minorUnits: 2500
          }
        },
        context
      )
    ).rejects.toMatchObject({
      code: "external_rail_provider_not_supported"
    });
  });
});
