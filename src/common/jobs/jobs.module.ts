import { Global, Module } from "@nestjs/common";

import { JobsService } from "@/common/jobs/jobs.service";

@Global()
@Module({
  providers: [JobsService],
  exports: [JobsService]
})
export class JobsModule {}
