import { describe, expect, it } from "vitest";

import { AppException } from "@/common/errors/app-exception";
import { assertTransferTransition } from "@/modules/transfers/domain/transfer-state-machine";

describe("assertTransferTransition", () => {
  it("allows documented state progressions", () => {
    expect(() => assertTransferTransition("VALIDATED", "PENDING_LEDGER")).not.toThrow();
    expect(() => assertTransferTransition("FAILED", "COMPENSATED")).not.toThrow();
  });

  it("rejects invalid transitions", () => {
    expect(() => assertTransferTransition("SETTLED", "FAILED")).toThrow(AppException);
  });
});
