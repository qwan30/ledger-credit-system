import { describe, expect, it } from "vitest";

import { createCreditAssessmentSchema } from "@/modules/credit/credit.schemas";

describe("createCreditAssessmentSchema", () => {
  it("accepts valid credit assessment requests", () => {
    expect(
      createCreditAssessmentSchema.parse({
        customerId: "11111111-1111-1111-1111-111111111111",
        requestedBy: "ops-user"
      })
    ).toEqual({
      customerId: "11111111-1111-1111-1111-111111111111",
      requestedBy: "ops-user"
    });
  });

  it("rejects invalid credit assessment requests", () => {
    expect(() =>
      createCreditAssessmentSchema.parse({
        customerId: "invalid",
        requestedBy: ""
      })
    ).toThrow();
  });
});
