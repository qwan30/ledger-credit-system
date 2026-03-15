import { Global, Module } from "@nestjs/common";

import { AppConfigService } from "@/common/config/app-config.service";

@Global()
@Module({
  providers: [AppConfigService],
  exports: [AppConfigService]
})
export class AppConfigModule {}
