import { Module } from "@nestjs/common";

import { AuditModule } from "@/modules/audit/audit.module";
import { LedgerModule } from "@/modules/ledger/ledger.module";
import { TransfersController } from "@/modules/transfers/transfers.controller";
import { ExternalRailSimulatorService } from "@/modules/transfers/external-rail-simulator.service";
import { TransfersService } from "@/modules/transfers/transfers.service";
import { IdempotencyService } from "@/common/idempotency/idempotency.service";

@Module({
  imports: [AuditModule, LedgerModule],
  controllers: [TransfersController],
  providers: [TransfersService, ExternalRailSimulatorService, IdempotencyService],
  exports: [TransfersService]
})
export class TransfersModule {}
