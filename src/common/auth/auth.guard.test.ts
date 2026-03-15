import { describe, expect, it, vi } from "vitest";

import { AppException } from "@/common/errors/app-exception";
import { AuthGuard } from "@/common/auth/auth.guard";

function createExecutionContext(request: object) {
  return {
    getHandler: vi.fn(),
    getClass: vi.fn(),
    switchToHttp: () => ({
      getRequest: () => request
    })
  } as never;
}

describe("AuthGuard", () => {
  it("allows public handlers without verifying a token", async () => {
    const guard = new AuthGuard(
      {
        getAllAndOverride: vi.fn().mockReturnValue(true)
      } as never,
      {
        verifyAsync: vi.fn()
      } as never,
      {
        jwtSecret: "secret-value"
      } as never
    );

    await expect(guard.canActivate(createExecutionContext({ headers: {} }))).resolves.toBe(true);
  });

  it("rejects requests without a bearer token", async () => {
    const guard = new AuthGuard(
      {
        getAllAndOverride: vi.fn().mockReturnValue(false)
      } as never,
      {
        verifyAsync: vi.fn()
      } as never,
      {
        jwtSecret: "secret-value"
      } as never
    );

    await expect(guard.canActivate(createExecutionContext({ headers: {} }))).rejects.toBeInstanceOf(AppException);
  });

  it("verifies the token and stores the actor in request context", async () => {
    const request = {
      headers: {
        authorization: "Bearer signed-token",
        "x-correlation-id": "corr-1"
      }
    };
    const verifyAsync = vi.fn().mockResolvedValue({
      sub: "actor-1",
      actorType: "ADMIN",
      roles: ["ADMIN"]
    });
    const guard = new AuthGuard(
      {
        getAllAndOverride: vi.fn().mockReturnValue(false)
      } as never,
      {
        verifyAsync
      } as never,
      {
        jwtSecret: "secret-value"
      } as never
    );

    await expect(guard.canActivate(createExecutionContext(request))).resolves.toBe(true);
    expect(verifyAsync).toHaveBeenCalledWith("signed-token", {
      secret: "secret-value"
    });
    expect((request as { context?: { actor?: { actorId: string } } }).context?.actor?.actorId).toBe("actor-1");
  });
});
