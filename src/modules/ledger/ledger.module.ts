import { Module } from "@nestjs/common";

import { LedgerService } from "@/modules/ledger/ledger.service";

@Module({
  providers: [LedgerService],
  exports: [LedgerService]
})
export class LedgerModule {}
