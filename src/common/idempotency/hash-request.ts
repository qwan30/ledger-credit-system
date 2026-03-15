import { createHash } from "node:crypto";

export function hashRequestPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
