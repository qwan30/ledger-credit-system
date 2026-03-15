import { Module } from "@nestjs/common";

import { AuditService } from "@/modules/audit/audit.service";

@Module({
  providers: [AuditService],
  exports: [AuditService]
})
export class AuditModule {}
