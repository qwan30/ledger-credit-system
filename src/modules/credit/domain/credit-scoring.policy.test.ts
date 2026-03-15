import { describe, expect, it } from "vitest";

import { computeCreditDecision } from "@/modules/credit/domain/credit-scoring.policy";

describe("computeCreditDecision", () => {
  it("produces a bounded score in the required range", () => {
    const decision = computeCreditDecision(
      {
        paymentHistoryPoints: 210,
        averageBalanceMinor: 600_000n,
        transactionFrequency: 22
      },
      {
        approveThreshold: 700,
        rejectThreshold: 550
      }
    );

    expect(decision.score).toBeGreaterThanOrEqual(300);
    expect(decision.score).toBeLessThanOrEqual(850);
    expect(decision.status).toBe("APPROVED");
  });

  it("rejects low-signal profiles", () => {
    const decision = computeCreditDecision(
      {
        paymentHistoryPoints: 40,
        averageBalanceMinor: 5_000n,
        transactionFrequency: 2
      },
      {
        approveThreshold: 700,
        rejectThreshold: 550
      }
    );

    expect(decision.status).toBe("REJECTED");
  });
});
