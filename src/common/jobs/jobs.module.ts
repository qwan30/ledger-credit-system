import { Global, Module } from "@nestjs/common";

import { AppConfigModule } from "@/common/config/app-config.module";
import { JobsService } from "@/common/jobs/jobs.service";

@Global()
@Module({
  imports: [AppConfigModule],
  providers: [JobsService],
  exports: [JobsService]
})
export class JobsModule {}
