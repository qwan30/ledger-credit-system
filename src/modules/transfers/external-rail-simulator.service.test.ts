import { describe, expect, it, vi } from "vitest";

import { ExternalRailSimulatorService } from "@/modules/transfers/external-rail-simulator.service";

describe("ExternalRailSimulatorService", () => {
  it("registers the external transfer worker on module init", async () => {
    const registerHandler = vi.fn().mockResolvedValue(undefined);
    const service = new ExternalRailSimulatorService(
      {
        registerHandler
      } as never,
      {} as never,
      {
        externalSimulatorSettlementDelayMs: 0
      } as never,
      {} as never,
      {} as never
    );

    await service.onModuleInit();

    expect(registerHandler).toHaveBeenCalled();
  });

  it("ignores transfers that are not pending external settlement", async () => {
    const create = vi.fn();
    const service = new ExternalRailSimulatorService(
      {} as never,
      {
        transferRequest: {
          findUnique: vi.fn().mockResolvedValue(null)
        },
        externalTransferEvent: {
          create
        }
      } as never,
      {
        externalSimulatorSettlementDelayMs: 0
      } as never,
      {} as never,
      {
        record: vi.fn()
      } as never
    );

    const internalService = service as unknown as { process: (transferRequestId: string) => Promise<void> };

    await expect(internalService.process("transfer-1")).resolves.toBeUndefined();
    expect(create).not.toHaveBeenCalled();
  });

  it("settles successful simulated external transfers", async () => {
    const record = vi.fn().mockResolvedValue(undefined);
    const service = new ExternalRailSimulatorService(
      {} as never,
      {
        transferRequest: {
          findUnique: vi.fn().mockResolvedValue({
            id: "transfer-1",
            status: "PENDING_EXTERNAL",
            externalReference: "sim_1",
            correlationId: "corr-1",
            idempotencyKey: "idem-1",
            destinationExternalAccountNumber: "12345678",
            sourceAccount: {
              ledgerAccount: {
                id: "ledger-source"
              }
            }
          })
        },
        externalTransferEvent: {
          create: vi.fn().mockResolvedValue(undefined)
        },
        $transaction: vi.fn((callback) =>
          callback({
            transferRequest: {
              findUnique: vi.fn().mockResolvedValue({
                id: "transfer-1",
                status: "PENDING_EXTERNAL"
              }),
              update: vi.fn().mockResolvedValue(undefined)
            },
            externalTransferEvent: {
              create: vi.fn().mockResolvedValue(undefined)
            }
          })
        )
      } as never,
      {
        externalSimulatorSettlementDelayMs: 0
      } as never,
      {} as never,
      {
        record
      } as never
    );

    const internalService = service as unknown as { process: (transferRequestId: string) => Promise<void> };

    await expect(internalService.process("transfer-1")).resolves.toBeUndefined();
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        correlationId: "corr-1"
      }),
      expect.objectContaining({
        actionType: "transfer.settled"
      })
    );
  });

  it("compensates failed simulated external transfers", async () => {
    const postJournalEntry = vi.fn().mockResolvedValue(undefined);
    const record = vi.fn().mockResolvedValue(undefined);
    const service = new ExternalRailSimulatorService(
      {} as never,
      {
        transferRequest: {
          findUnique: vi.fn().mockResolvedValue({
            id: "transfer-2",
            status: "PENDING_EXTERNAL",
            externalReference: "sim_2",
            correlationId: "corr-2",
            idempotencyKey: "idem-2",
            destinationExternalAccountNumber: "123499",
            sourceAccount: {
              ledgerAccount: {
                id: "ledger-source"
              }
            }
          })
        },
        externalTransferEvent: {
          create: vi.fn().mockResolvedValue(undefined)
        },
        $transaction: vi.fn((callback) =>
          callback({
            transferRequest: {
              findUnique: vi.fn().mockResolvedValue({
                id: "transfer-2",
                status: "PENDING_EXTERNAL",
                currency: "USD",
                amountMinor: 1000n,
                correlationId: "corr-2",
                idempotencyKey: "idem-2"
              }),
              update: vi.fn().mockResolvedValue(undefined)
            },
            externalTransferEvent: {
              create: vi.fn().mockResolvedValue(undefined)
            }
          })
        )
      } as never,
      {
        externalSimulatorSettlementDelayMs: 0
      } as never,
      {
        findSystemLedgerAccount: vi.fn().mockResolvedValue({
          id: "ledger-clearing"
        }),
        postJournalEntry
      } as never,
      {
        record
      } as never
    );

    const internalService = service as unknown as { process: (transferRequestId: string) => Promise<void> };

    await expect(internalService.process("transfer-2")).resolves.toBeUndefined();
    expect(postJournalEntry).toHaveBeenCalled();
    expect(record).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        actionType: "transfer.compensated"
      })
    );
  });
});
