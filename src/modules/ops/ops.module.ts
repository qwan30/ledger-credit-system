import { Module } from "@nestjs/common";

import { AuditModule } from "@/modules/audit/audit.module";
import { BatchModule } from "@/modules/batch/batch.module";
import { CreditModule } from "@/modules/credit/credit.module";
import { OpsController } from "@/modules/ops/ops.controller";
import { TransfersModule } from "@/modules/transfers/transfers.module";

@Module({
  imports: [AuditModule, TransfersModule, BatchModule, CreditModule],
  controllers: [OpsController]
})
export class OpsModule {}
