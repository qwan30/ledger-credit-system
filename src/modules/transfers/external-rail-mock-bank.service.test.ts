import { describe, expect, it } from "vitest";

import { ExternalRailMockBankService } from "@/modules/transfers/external-rail-mock-bank.service";

describe("ExternalRailMockBankService", () => {
  it("builds acknowledged and settled events for successful transfers", async () => {
    const service = new ExternalRailMockBankService();

    const events = await service.submitTransfer({
      transferRequestId: "transfer-1",
      externalReference: "mock-bank_1",
      destinationExternalAccountNumber: "12345678"
    });

    expect(events).toHaveLength(2);
    expect(events[0]?.eventType).toBe("ACKNOWLEDGED");
    expect(events[1]?.eventType).toBe("SETTLED");
  });

  it("normalizes provider-specific callback payloads", async () => {
    const service = new ExternalRailMockBankService();

    await expect(
      service.normalizeInboundEvent({
        eventId: "mock-event-1",
        transfer: {
          reference: "mock-bank_1"
        },
        outcome: {
          state: "rejected",
          reason: "Beneficiary account was closed."
        }
      })
    ).resolves.toMatchObject({
      provider: "mock-bank",
      providerEventId: "mock-event-1",
      externalReference: "mock-bank_1",
      eventType: "FAILED",
      failureReason: "Beneficiary account was closed."
    });
  });
});
