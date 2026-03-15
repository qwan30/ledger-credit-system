import type { ArgumentsHost } from "@nestjs/common";
import { z } from "zod";
import { describe, expect, it, vi } from "vitest";

import { AppException } from "@/common/errors/app-exception";
import { HttpExceptionFilter } from "@/common/errors/http-exception.filter";

function createHost() {
  const send = vi.fn();
  const status = vi.fn().mockReturnValue({ send });

  return {
    send,
    status,
    host: {
      switchToHttp: () => ({
        getResponse: () => ({
          status,
          send
        })
      })
    } as ArgumentsHost
  };
}

describe("HttpExceptionFilter", () => {
  it("maps AppException into the standard error envelope", () => {
    const { host, status, send } = createHost();

    new HttpExceptionFilter().catch(new AppException(409, "conflict", "Conflict"), host);

    expect(status).toHaveBeenCalledWith(409);
    expect(send).toHaveBeenCalledWith({
      error: {
        code: "conflict",
        message: "Conflict",
        details: undefined
      }
    });
  });

  it("maps ZodError into a validation error envelope", () => {
    const { host, send } = createHost();
    const schema = z.object({
      amount: z.number().min(1)
    });
    const parsed = schema.safeParse({
      amount: 0
    });

    new HttpExceptionFilter().catch(parsed.error, host);

    expect(send).toHaveBeenCalledWith({
      error: {
        code: "validation_error",
        message: "Request validation failed",
        details: [
          {
            field: "amount",
            message: expect.any(String)
          }
        ]
      }
    });
  });

  it("returns a generic internal error for unknown exceptions", () => {
    const { host, status, send } = createHost();

    new HttpExceptionFilter().catch(new Error("boom"), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(send).toHaveBeenCalledWith({
      error: {
        code: "internal_error",
        message: "An unexpected error occurred."
      }
    });
  });
});
