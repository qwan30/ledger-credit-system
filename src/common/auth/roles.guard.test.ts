import { describe, expect, it, vi } from "vitest";

import { AppException } from "@/common/errors/app-exception";
import { RolesGuard } from "@/common/auth/roles.guard";

function createExecutionContext(request: object) {
  return {
    getHandler: vi.fn(),
    getClass: vi.fn(),
    switchToHttp: () => ({
      getRequest: () => request
    })
  } as never;
}

describe("RolesGuard", () => {
  it("allows handlers without role requirements", () => {
    const guard = new RolesGuard({
      getAllAndOverride: vi.fn().mockReturnValue(undefined)
    } as never);

    expect(guard.canActivate(createExecutionContext({ headers: {} }))).toBe(true);
  });

  it("rejects actors without the required role", () => {
    const guard = new RolesGuard({
      getAllAndOverride: vi.fn().mockReturnValue(["ADMIN"])
    } as never);

    expect(() =>
      guard.canActivate(
        createExecutionContext({
          headers: {},
          context: {
            correlationId: "corr-1",
            actor: {
              actorId: "ops-1",
              actorType: "OPS",
              roles: ["OPS"]
            }
          }
        })
      )
    ).toThrow(AppException);
  });

  it("allows actors with one of the required roles", () => {
    const guard = new RolesGuard({
      getAllAndOverride: vi.fn().mockReturnValue(["OPS", "ADMIN"])
    } as never);

    expect(
      guard.canActivate(
        createExecutionContext({
          headers: {},
          context: {
            correlationId: "corr-1",
            actor: {
              actorId: "ops-1",
              actorType: "OPS",
              roles: ["OPS"]
            }
          }
        })
      )
    ).toBe(true);
  });
});
