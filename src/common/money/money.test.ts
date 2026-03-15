import { describe, expect, it } from "vitest";

import { AppException } from "@/common/errors/app-exception";
import { Money } from "@/common/money/money";

describe("Money", () => {
  it("adds exact minor-unit values without floating point math", () => {
    const result = Money.fromMinorUnits("usd", 12_500).add(Money.fromMinorUnits("USD", 2_500));

    expect(result.currency).toBe("USD");
    expect(result.minorUnits).toBe(15_000n);
  });

  it("rejects non-safe integer number input", () => {
    expect(() => Money.fromMinorUnits("USD", 1.25)).toThrow(AppException);
  });

  it("throws on currency mismatch", () => {
    expect(() => Money.fromMinorUnits("USD", 1).add(Money.fromMinorUnits("EUR", 1))).toThrow(AppException);
  });
});
