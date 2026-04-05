import { Module } from "@nestjs/common";

import { AuditModule } from "@/modules/audit/audit.module";
import { ExternalRailController } from "@/modules/transfers/external-rail.controller";
import { ExternalRailMockBankService } from "@/modules/transfers/external-rail-mock-bank.service";
import { ExternalRailRegistry } from "@/modules/transfers/external-rail.registry";
import { ExternalRailService } from "@/modules/transfers/external-rail.service";
import { LedgerModule } from "@/modules/ledger/ledger.module";
import { TransfersController } from "@/modules/transfers/transfers.controller";
import { ExternalRailSimulatorService } from "@/modules/transfers/external-rail-simulator.service";
import { TransfersService } from "@/modules/transfers/transfers.service";
import { IdempotencyService } from "@/common/idempotency/idempotency.service";

@Module({
  imports: [AuditModule, LedgerModule],
  controllers: [TransfersController, ExternalRailController],
  providers: [
    TransfersService,
    ExternalRailService,
    ExternalRailRegistry,
    ExternalRailSimulatorService,
    ExternalRailMockBankService,
    IdempotencyService
  ],
  exports: [TransfersService, ExternalRailService]
})
export class TransfersModule {}
