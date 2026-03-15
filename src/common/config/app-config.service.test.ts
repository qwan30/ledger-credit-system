import { describe, expect, it, vi } from "vitest";

import { AppConfigService } from "@/common/config/app-config.service";

describe("AppConfigService", () => {
  it("reads and coerces configured values", () => {
    const get = vi.fn((key: string) => {
      const values: Record<string, unknown> = {
        PORT: "3000",
        DATABASE_URL: "postgres://db",
        JWT_SECRET: "secret-value",
        SUPPORTED_CURRENCIES: ["USD"],
        BUSINESS_TIMEZONE: "UTC",
        CLOSE_WINDOW_CRON: "0 0 * * *",
        BATCH_SHARD_SIZE: "500",
        SCORE_APPROVE_THRESHOLD: "700",
        SCORE_REJECT_THRESHOLD: "550",
        RATE_LIMIT_MAX: "100",
        RATE_LIMIT_WINDOW_MS: "60000",
        EXTERNAL_SIMULATOR_SETTLEMENT_DELAY_MS: "100",
        INTEREST_RATE_BPS: "250"
      };

      return values[key];
    });
    const service = new AppConfigService({
      get
    } as never);

    expect(service.port).toBe(3000);
    expect(service.databaseUrl).toBe("postgres://db");
    expect(service.jwtSecret).toBe("secret-value");
    expect(service.supportedCurrencies).toEqual(["USD"]);
    expect(service.businessTimezone).toBe("UTC");
    expect(service.closeWindowCron).toBe("0 0 * * *");
    expect(service.batchShardSize).toBe(500);
    expect(service.scoreApproveThreshold).toBe(700);
    expect(service.scoreRejectThreshold).toBe(550);
    expect(service.rateLimitMax).toBe(100);
    expect(service.rateLimitWindowMs).toBe(60000);
    expect(service.externalSimulatorSettlementDelayMs).toBe(100);
    expect(service.interestRateBps).toBe(250n);
  });
});
