import { afterEach, describe, expect, it, vi } from "vitest";

const requiredEnvironmentKeys = [
  "DATABASE_URL",
  "JWT_SECRET",
  "SUPPORTED_CURRENCIES",
  "BUSINESS_TIMEZONE",
  "CLOSE_WINDOW_CRON"
] as const;

const originalEnvironment = { ...process.env };

afterEach(() => {
  vi.resetModules();
  process.env = { ...originalEnvironment };
});

describe("bootstrap module", () => {
  it("can be imported before the application environment is configured", async () => {
    for (const key of requiredEnvironmentKeys) {
      delete process.env[key];
    }

    const bootstrapModule = await import("@/bootstrap");

    expect(bootstrapModule.applyAppSetup).toBeTypeOf("function");
    expect(bootstrapModule.createApp).toBeTypeOf("function");
  });
});
