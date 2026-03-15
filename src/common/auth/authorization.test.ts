import { describe, expect, it } from "vitest";

import { AppException } from "@/common/errors/app-exception";
import { assertAuthenticated, assertCustomerOwnsResource } from "@/common/auth/authorization";

describe("authorization helpers", () => {
  it("allows customers to access their own resources", () => {
    expect(() =>
      assertCustomerOwnsResource(
        {
          correlationId: "corr-1",
          actor: {
            actorId: "customer-1",
            actorType: "CUSTOMER",
            roles: ["CUSTOMER"]
          }
        },
        "customer-1"
      )
    ).not.toThrow();
  });

  it("rejects customers accessing a different owner resource", () => {
    expect(() =>
      assertCustomerOwnsResource(
        {
          correlationId: "corr-1",
          actor: {
            actorId: "customer-1",
            actorType: "CUSTOMER",
            roles: ["CUSTOMER"]
          }
        },
        "customer-2"
      )
    ).toThrow(AppException);
  });

  it("requires an authenticated actor when requested", () => {
    expect(() =>
      assertAuthenticated({
        correlationId: "corr-1"
      })
    ).toThrow(AppException);
  });
});
