import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";

import { AuthModule } from "@/common/auth/auth.module";
import { AppConfigModule } from "@/common/config/app-config.module";
import { validateEnvironment } from "@/common/config/env.schema";
import { JobsModule } from "@/common/jobs/jobs.module";
import { PrismaModule } from "@/common/prisma/prisma.module";
import { AccountsModule } from "@/modules/accounts/accounts.module";
import { AuditModule } from "@/modules/audit/audit.module";
import { BatchModule } from "@/modules/batch/batch.module";
import { CreditModule } from "@/modules/credit/credit.module";
import { HealthModule } from "@/modules/health/health.module";
import { LedgerModule } from "@/modules/ledger/ledger.module";
import { OpsModule } from "@/modules/ops/ops.module";
import { TransfersModule } from "@/modules/transfers/transfers.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnvironment
    }),
    AppConfigModule,
    LoggerModule.forRoot({
      pinoHttp: {
        redact: {
          paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "res.headers['set-cookie']"
          ],
          censor: "[REDACTED]"
        }
      }
    }),
    PrismaModule,
    JobsModule,
    AuthModule,
    AuditModule,
    LedgerModule,
    HealthModule,
    AccountsModule,
    TransfersModule,
    CreditModule,
    BatchModule,
    OpsModule
  ]
})
export class AppModule {}
