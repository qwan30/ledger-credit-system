import { Module } from "@nestjs/common";

import { AuditModule } from "@/modules/audit/audit.module";
import { LedgerModule } from "@/modules/ledger/ledger.module";
import { BatchController } from "@/modules/batch/batch.controller";
import { BatchService } from "@/modules/batch/batch.service";

@Module({
  imports: [AuditModule, LedgerModule],
  controllers: [BatchController],
  providers: [BatchService],
  exports: [BatchService]
})
export class BatchModule {}
