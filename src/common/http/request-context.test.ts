import { afterEach, describe, expect, it, vi } from "vitest";

import { getRequestContext } from "@/common/http/request-context";

describe("getRequestContext", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds a context from request headers", () => {
    const request = {
      headers: {
        "x-correlation-id": "corr-1",
        "idempotency-key": "idem-1"
      }
    };

    expect(getRequestContext(request as never)).toEqual({
      correlationId: "corr-1",
      idempotencyKey: "idem-1"
    });
  });

  it("generates a correlation id when absent and preserves existing actor state", () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("11111111-1111-1111-1111-111111111111");

    const request = {
      headers: {},
      context: {
        actor: {
          actorId: "actor-1",
          actorType: "OPS",
          roles: ["OPS"]
        },
        correlationId: "existing-corr"
      }
    };

    expect(getRequestContext(request as never)).toEqual({
      actor: {
        actorId: "actor-1",
        actorType: "OPS",
        roles: ["OPS"]
      },
      correlationId: "existing-corr"
    });
  });
});
