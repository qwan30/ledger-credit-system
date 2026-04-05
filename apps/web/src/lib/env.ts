import { z } from "zod";

const envSchema = z.object({
  JAVA_API_BASE_URL: z.string().url().default("http://localhost:8080/api/v1"),
  SESSION_COOKIE_NAME: z.string().min(1).default("ledger_credit_session"),
});

export const appEnv = envSchema.parse({
  JAVA_API_BASE_URL: process.env.JAVA_API_BASE_URL,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
});
