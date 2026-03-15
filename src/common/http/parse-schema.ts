import type { ZodType } from "zod";

import { AppException } from "@/common/errors/app-exception";

export function parseSchema<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new AppException(
      422,
      "validation_error",
      "Request validation failed",
      result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }))
    );
  }

  return result.data;
}
