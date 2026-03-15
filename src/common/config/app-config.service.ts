import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { AppEnvironment } from "@/common/config/env.schema";

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService<AppEnvironment, true>) {}

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

  get externalSimulatorSettlementDelayMs(): number {
    return Number(this.configService.get("EXTERNAL_SIMULATOR_SETTLEMENT_DELAY_MS", { infer: true }));
  }

  get interestRateBps(): bigint {
    return BigInt(this.configService.get("INTEREST_RATE_BPS", { infer: true }));
  }
}
