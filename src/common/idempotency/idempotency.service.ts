import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { AppException } from "@/common/errors/app-exception";

export interface IdempotencyBeginResult {
  recordId?: string;
  replay?: {
    statusCode: number;
    body: unknown;
  };
}

@Injectable()
export class IdempotencyService {
  async begin(
    tx: Prisma.TransactionClient,
    operationType: string,
    key: string,
    requestHash: string
  ): Promise<IdempotencyBeginResult> {
    const existing = await tx.idempotencyRecord.findUnique({
      where: {
        operationType_key: {
          operationType,
          key
        }
      }
    });

    if (existing) {
      if (existing.requestHash !== requestHash) {
        throw new AppException(409, "idempotency_conflict", "Idempotency key was already used with a different payload.");
      }

      if (existing.responseStatusCode && existing.responseBody) {
        return {
          replay: {
            statusCode: existing.responseStatusCode,
            body: existing.responseBody
          }
        };
      }

      throw new AppException(409, "idempotency_in_progress", "A request with this idempotency key is still in progress.");
    }

    const created = await tx.idempotencyRecord.create({
      data: {
        key,
        operationType,
        requestHash,
        status: "IN_PROGRESS"
      }
    });

    return {
      recordId: created.id
    };
  }

  async complete(
    tx: Prisma.TransactionClient,
    recordId: string,
    statusCode: number,
    body: unknown,
    resourceType: string,
    resourceId: string
  ): Promise<void> {
    await tx.idempotencyRecord.update({
      where: { id: recordId },
      data: {
        status: "SUCCEEDED",
        responseStatusCode: statusCode,
        responseBody: body as Prisma.InputJsonValue,
        resourceType,
        resourceId
      }
    });
  }

  async fail(
    tx: Prisma.TransactionClient,
    recordId: string,
    statusCode: number,
    body: unknown
  ): Promise<void> {
    await tx.idempotencyRecord.update({
      where: { id: recordId },
      data: {
        status: "FAILED",
        responseStatusCode: statusCode,
        responseBody: body as Prisma.InputJsonValue
      }
    });
  }
}
