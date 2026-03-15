import { Module } from "@nestjs/common";

import { AuditModule } from "@/modules/audit/audit.module";
import { AccountsController } from "@/modules/accounts/accounts.controller";
import { AccountsService } from "@/modules/accounts/accounts.service";

@Module({
  imports: [AuditModule],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService]
})
export class AccountsModule {}
