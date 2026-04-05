import { z } from "zod";

const numericString = z
  .string()
  .trim()
  .min(1)
  .regex(/^\d+$/);

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: numericString.default("3000"),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  SUPPORTED_CURRENCIES: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((currency) => currency.trim().toUpperCase())
        .filter(Boolean)
    )
    .refine((value) => value.length > 0, { message: "At least one currency must be configured." }),
  BUSINESS_TIMEZONE: z.string().min(1),
  CLOSE_WINDOW_CRON: z.string().min(1),
  BATCH_SHARD_SIZE: numericString.default("500"),
  BATCH_WORKER_CONCURRENCY: numericString.default("25"),
  SCORE_APPROVE_THRESHOLD: numericString.default("700"),
  SCORE_REJECT_THRESHOLD: numericString.default("550"),
  RATE_LIMIT_MAX: numericString.default("100"),
  RATE_LIMIT_WINDOW_MS: numericString.default("60000"),
  EXTERNAL_RAIL_DEFAULT_PROVIDER: z.string().trim().min(1).default("simulator"),
  EXTERNAL_RAIL_CALLBACK_SECRET: z.string().trim().min(8).default("callback-secret"),
  EXTERNAL_SIMULATOR_SETTLEMENT_DELAY_MS: numericString.default("250"),
  INTEREST_RATE_BPS: numericString.default("250"),
  AUTH_ACCESS_TTL_SECONDS: numericString.default("900"),
  AUTH_REFRESH_TTL_SECONDS: numericString.default("604800"),
  AUTH_INTERNAL_ISSUER: z.string().trim().min(1).default("ledger-credit-system"),
  AUTH_CUSTOMER_AUDIENCE: z.string().trim().min(1).default("customer-api"),
  AUTH_OPERATOR_AUDIENCE: z.string().trim().min(1).default("ops-api"),
  AUTH_OIDC_ISSUER: z.string().trim().url().optional(),
  AUTH_OIDC_JWKS_URI: z.string().trim().url().optional(),
  AUTH_OIDC_AUDIENCE: z.string().trim().min(1).optional()
});

export type AppEnvironment = z.infer<typeof envSchema>;

export function validateEnvironment(config: Record<string, unknown>): AppEnvironment {
  return envSchema.parse(config);
}
