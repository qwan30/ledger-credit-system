import { z } from "zod";
import { describe, expect, it } from "vitest";

import { AppException } from "@/common/errors/app-exception";
import { parseSchema } from "@/common/http/parse-schema";

describe("parseSchema", () => {
  const schema = z.object({
    name: z.string().min(1)
  });

  it("returns parsed input when validation succeeds", () => {
    expect(parseSchema(schema, { name: "ledger" })).toEqual({ name: "ledger" });
  });

  it("throws an AppException when validation fails", () => {
    expect(() => parseSchema(schema, { name: "" })).toThrow(AppException);
  });
});
