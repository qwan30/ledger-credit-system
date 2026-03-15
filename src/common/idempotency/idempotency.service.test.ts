import { describe, expect, it, vi } from "vitest";

import { AppException } from "@/common/errors/app-exception";
import { IdempotencyService } from "@/common/idempotency/idempotency.service";

describe("IdempotencyService", () => {
  it("creates a new idempotency record when the key is unused", async () => {
    const tx = {
      idempotencyRecord: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "idem-record-1" })
      }
    } as never;
    const service = new IdempotencyService();

    await expect(service.begin(tx, "transfer.create", "idem-1", "hash-1")).resolves.toEqual({
      recordId: "idem-record-1"
    });
  });

  it("replays a completed request when the key and payload match", async () => {
    const tx = {
      idempotencyRecord: {
        findUnique: vi.fn().mockResolvedValue({
          requestHash: "hash-1",
          responseStatusCode: 200,
          responseBody: { data: { id: "transfer-1" } }
        })
      }
    } as never;
    const service = new IdempotencyService();

    await expect(service.begin(tx, "transfer.create", "idem-1", "hash-1")).resolves.toEqual({
      replay: {
        statusCode: 200,
        body: { data: { id: "transfer-1" } }
      }
    });
  });

  it("rejects conflicting payloads for the same key", async () => {
    const tx = {
      idempotencyRecord: {
        findUnique: vi.fn().mockResolvedValue({
          requestHash: "hash-1"
        })
      }
    } as never;
    const service = new IdempotencyService();

    await expect(service.begin(tx, "transfer.create", "idem-1", "hash-2")).rejects.toBeInstanceOf(AppException);
  });

  it("marks records as completed and failed", async () => {
    const update = vi.fn();
    const tx = {
      idempotencyRecord: {
        update
      }
    } as never;
    const service = new IdempotencyService();

    await service.complete(tx, "record-1", 200, { ok: true }, "transfer_request", "transfer-1");
    await service.fail(tx, "record-1", 500, { error: true });

    expect(update).toHaveBeenCalledTimes(2);
  });
});
