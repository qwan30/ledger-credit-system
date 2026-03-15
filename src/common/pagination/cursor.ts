import { Buffer } from "node:buffer";

export interface CursorPayload {
  effectiveAt: string;
  id: string;
}

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeCursor(cursor?: string): CursorPayload | undefined {
  if (!cursor) {
    return undefined;
  }

  return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as CursorPayload;
}
