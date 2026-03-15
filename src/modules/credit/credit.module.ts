import { Module } from "@nestjs/common";

import { IdempotencyService } from "@/common/idempotency/idempotency.service";
import { AuditModule } from "@/modules/audit/audit.module";
import { CreditController } from "@/modules/credit/credit.controller";
import { CreditService } from "@/modules/credit/credit.service";

@Module({
  imports: [AuditModule],
  controllers: [CreditController],
  providers: [CreditService, IdempotencyService],
  exports: [CreditService]
})
export class CreditModule {}
