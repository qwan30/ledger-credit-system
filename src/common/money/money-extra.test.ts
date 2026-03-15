import { describe, expect, it } from "vitest";

import { AppException } from "@/common/errors/app-exception";
import { Money } from "@/common/money/money";

describe("Money extra behavior", () => {
  it("supports subtraction, negate, zero, and negative checks", () => {
    const value = Money.fromMinorUnits("USD", 100);
    const result = value.subtract(Money.fromMinorUnits("USD", 150)).negate();

    expect(result.minorUnits).toBe(50n);
    expect(value.isZero()).toBe(false);
    expect(Money.fromMinorUnits("USD", 0).isZero()).toBe(true);
    expect(Money.fromMinorUnits("USD", -1).isNegative()).toBe(true);
  });

  it("serializes to JSON and rejects unsafe JSON numbers", () => {
    expect(Money.fromMinorUnits("USD", 100).toJSON()).toEqual({
      currency: "USD",
      minorUnits: 100
    });

    expect(() => Money.fromMinorUnits("USD", BigInt(Number.MAX_SAFE_INTEGER) + 1n).toJSON()).toThrow(AppException);
  });
});
