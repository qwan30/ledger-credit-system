import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { AppEnvironment } from "@/common/config/env.schema";

@Injectable()
export class AppConfigService {
  constructor(@Inject(ConfigService) private readonly configService: ConfigService<AppEnvironment, true>) {}

  get nodeEnv(): AppEnvironment["NODE_ENV"] {
    return this.configService.get("NODE_ENV", { infer: true });
  }

  get port(): number {
    return Number(this.configService.get("PORT", { infer: true }));
  }

  get databaseUrl(): string {
    return this.configService.get("DATABASE_URL", { infer: true });
  }

  get jwtSecret(): string {
    return this.configService.get("JWT_SECRET", { infer: true });
  }

  get supportedCurrencies(): string[] {
    return this.configService.get("SUPPORTED_CURRENCIES", { infer: true });
  }

  get businessTimezone(): string {
    return this.configService.get("BUSINESS_TIMEZONE", { infer: true });
  }

  get closeWindowCron(): string {
    return this.configService.get("CLOSE_WINDOW_CRON", { infer: true });
  }

  get batchShardSize(): number {
    return Number(this.configService.get("BATCH_SHARD_SIZE", { infer: true }));
  }

  get batchWorkerConcurrency(): number {
    return Number(this.configService.get("BATCH_WORKER_CONCURRENCY", { infer: true }));
  }

  get scoreApproveThreshold(): number {
    return Number(this.configService.get("SCORE_APPROVE_THRESHOLD", { infer: true }));
  }

  get scoreRejectThreshold(): number {
    return Number(this.configService.get("SCORE_REJECT_THRESHOLD", { infer: true }));
  }

  get rateLimitMax(): number {
    return Number(this.configService.get("RATE_LIMIT_MAX", { infer: true }));
  }

  get rateLimitWindowMs(): number {
    return Number(this.configService.get("RATE_LIMIT_WINDOW_MS", { infer: true }));
  }

  get externalRailDefaultProvider(): string {
    return this.configService.get("EXTERNAL_RAIL_DEFAULT_PROVIDER", { infer: true });
  }

  get externalRailCallbackSecret(): string {
    return this.configService.get("EXTERNAL_RAIL_CALLBACK_SECRET", { infer: true });
  }

  get externalSimulatorSettlementDelayMs(): number {
    return Number(this.configService.get("EXTERNAL_SIMULATOR_SETTLEMENT_DELAY_MS", { infer: true }));
  }

  get interestRateBps(): bigint {
    return BigInt(this.configService.get("INTEREST_RATE_BPS", { infer: true }));
  }

  get authAccessTtlSeconds(): number {
    return Number(this.configService.get("AUTH_ACCESS_TTL_SECONDS", { infer: true }));
  }

  get authRefreshTtlSeconds(): number {
    return Number(this.configService.get("AUTH_REFRESH_TTL_SECONDS", { infer: true }));
  }

  get authInternalIssuer(): string {
    return this.configService.get("AUTH_INTERNAL_ISSUER", { infer: true });
  }

  get authCustomerAudience(): string {
    return this.configService.get("AUTH_CUSTOMER_AUDIENCE", { infer: true });
  }

  get authOperatorAudience(): string {
    return this.configService.get("AUTH_OPERATOR_AUDIENCE", { infer: true });
  }

  get authOidcIssuer(): string | undefined {
    return this.configService.get("AUTH_OIDC_ISSUER", { infer: true });
  }

  get authOidcJwksUri(): string | undefined {
    return this.configService.get("AUTH_OIDC_JWKS_URI", { infer: true });
  }

  get authOidcAudience(): string | undefined {
    return this.configService.get("AUTH_OIDC_AUDIENCE", { infer: true });
  }
}
