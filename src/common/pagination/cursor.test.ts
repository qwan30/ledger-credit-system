import { describe, expect, it } from "vitest";

import { decodeCursor, encodeCursor } from "@/common/pagination/cursor";

describe("cursor helpers", () => {
  it("round-trips cursor payloads", () => {
    const encoded = encodeCursor({
      effectiveAt: "2026-03-15T00:00:00.000Z",
      id: "entry-1"
    });

    expect(decodeCursor(encoded)).toEqual({
      effectiveAt: "2026-03-15T00:00:00.000Z",
      id: "entry-1"
    });
  });

  it("returns undefined when no cursor is provided", () => {
    expect(decodeCursor(undefined)).toBeUndefined();
  });
});
