import { describe, expect, it, vi } from "vitest";

import { AppException } from "@/common/errors/app-exception";
import { ExternalRailService } from "@/modules/transfers/external-rail.service";

describe("ExternalRailService", () => {
  it("does not apply the same provider event twice", async () => {
    const adapter = {
      provider: "simulator",
      submitTransfer: vi.fn(),
      normalizeInboundEvent: vi.fn().mockResolvedValue({
        provider: "simulator",
        providerEventId: "provider-event-1",
        externalReference: "ext-1",
        eventType: "SETTLED",
        payload: {
          status: "SETTLED"
        }
      }),
      reconcileTransfer: vi.fn()
    };

    const externalTransferEventFindUnique = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "existing-event" });
    const transferUpdate = vi.fn().mockResolvedValue(undefined);

    const service = new ExternalRailService(
      {
        $transaction: vi.fn((callback) =>
          callback({
            externalTransferEvent: {
              findUnique: externalTransferEventFindUnique,
              create: vi.fn().mockResolvedValue(undefined)
            },
            transferRequest: {
              findFirst: vi.fn().mockResolvedValue({
                id: "transfer-1",
                status: "PENDING_EXTERNAL",
                externalReference: "ext-1",
                externalRailProvider: "simulator",
                correlationId: "corr-1",
                idempotencyKey: "idem-1",
                currency: "USD",
                amountMinor: 5000n,
                sourceAccountId: "account-1",
                destinationAccountId: null,
                destinationExternalBankCode: "BANK01",
                destinationExternalAccountNumber: "12345678",
                destinationExternalAccountName: "Receiver",
                failureReason: null,
                createdAt: new Date("2026-03-16T00:00:00.000Z"),
                sourceAccount: {
                  ledgerAccount: {
                    id: "ledger-source"
                  }
                }
              }),
              update: transferUpdate
            }
          })
        )
      } as never,
      {
        findSystemLedgerAccount: vi.fn().mockResolvedValue({ id: "ledger-clearing" }),
        postJournalEntry: vi.fn().mockResolvedValue(undefined)
      } as never,
      {
        record: vi.fn().mockResolvedValue(undefined)
      } as never,
      {
        registerHandler: vi.fn().mockResolvedValue(undefined),
        publish: vi.fn().mockResolvedValue(undefined)
      } as never,
      {
        get: vi.fn().mockReturnValue(adapter)
      } as never,
      {
        externalRailCallbackSecret: "callback-secret"
      } as never
    );

    await service.ingestProviderEvent("simulator", { externalReference: "ext-1", status: "SETTLED" });
    await service.ingestProviderEvent("simulator", { externalReference: "ext-1", status: "SETTLED" });

    expect(adapter.normalizeInboundEvent).toHaveBeenCalledTimes(2);
    expect(transferUpdate).toHaveBeenCalledTimes(1);
  });

  it("requires the configured callback secret", () => {
    const service = new ExternalRailService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {
        externalRailCallbackSecret: "callback-secret"
      } as never
    );

    expect(() => service.assertCallbackSecret("wrong-secret")).toThrow(AppException);
  });
});
