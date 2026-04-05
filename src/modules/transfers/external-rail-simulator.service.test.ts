import { describe, expect, it } from "vitest";

import { ExternalRailSimulatorService } from "@/modules/transfers/external-rail-simulator.service";

describe("ExternalRailSimulatorService", () => {
  it("builds acknowledged and settled events for successful transfers", async () => {
    const service = new ExternalRailSimulatorService({
      externalSimulatorSettlementDelayMs: 0
    } as never);

    const events = await service.submitTransfer({
      transferRequestId: "transfer-1",
      externalReference: "sim_1",
      destinationExternalAccountNumber: "12345678"
    });

    expect(events).toHaveLength(2);
    expect(events[0]?.eventType).toBe("ACKNOWLEDGED");
    expect(events[1]?.eventType).toBe("SETTLED");
  });

  it("builds failed events for rejected transfers", async () => {
    const service = new ExternalRailSimulatorService({
      externalSimulatorSettlementDelayMs: 0
    } as never);

    const events = await service.submitTransfer({
      transferRequestId: "transfer-2",
      externalReference: "sim_2",
      destinationExternalAccountNumber: "123499"
    });

    expect(events[1]).toMatchObject({
      eventType: "FAILED",
      failureReason: "Simulator rejected the transfer."
    });
  });

  it("normalizes validated callback payloads", async () => {
    const service = new ExternalRailSimulatorService({
      externalSimulatorSettlementDelayMs: 0
    } as never);

    await expect(
      service.normalizeInboundEvent({
        providerEventId: "provider-event-1",
        externalReference: "sim_3",
        status: "ACKNOWLEDGED"
      })
    ).resolves.toMatchObject({
      provider: "simulator",
      providerEventId: "provider-event-1",
      externalReference: "sim_3",
      eventType: "ACKNOWLEDGED"
    });
  });

  it("reconciles transfers according to simulator outcome rules", async () => {
    const service = new ExternalRailSimulatorService({
      externalSimulatorSettlementDelayMs: 0
    } as never);

    await expect(
      service.reconcileTransfer({
        transferRequestId: "transfer-4",
        externalReference: "sim_4",
        destinationExternalAccountNumber: "12345678"
      })
    ).resolves.toMatchObject({
      eventType: "SETTLED"
    });
  });
});
