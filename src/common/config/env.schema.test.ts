import { describe, expect, it } from "vitest";

import { validateEnvironment } from "@/common/config/env.schema";

describe("validateEnvironment", () => {
  it("parses and transforms a valid environment", () => {
    expect(
      validateEnvironment({
        PORT: "3000",
        DATABASE_URL: "https://example.com/db",
        JWT_SECRET: "very-secret-token",
        SUPPORTED_CURRENCIES: "usd, eur",
        BUSINESS_TIMEZONE: "UTC",
        CLOSE_WINDOW_CRON: "0 0 * * *",
        BATCH_SHARD_SIZE: "500",
        SCORE_APPROVE_THRESHOLD: "700",
        SCORE_REJECT_THRESHOLD: "550",
        RATE_LIMIT_MAX: "100",
        RATE_LIMIT_WINDOW_MS: "60000",
        EXTERNAL_SIMULATOR_SETTLEMENT_DELAY_MS: "100",
        INTEREST_RATE_BPS: "250"
      })
    ).toMatchObject({
      NODE_ENV: "development",
      SUPPORTED_CURRENCIES: ["USD", "EUR"]
    });
  });

  it("rejects invalid environments", () => {
    expect(() =>
      validateEnvironment({
        DATABASE_URL: "not-a-url"
      })
    ).toThrow();
  });
});
