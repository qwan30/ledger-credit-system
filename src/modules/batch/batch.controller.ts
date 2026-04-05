import { Controller, Get, Inject, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { Roles } from "@/common/auth/roles.decorator";
import { BatchService } from "@/modules/batch/batch.service";

@Controller("batch-runs")
@Roles("OPS", "AUDITOR", "ADMIN")
export class BatchController {
  constructor(@Inject(BatchService) private readonly batchService: BatchService) {}

  @Get(":batchRunId")
  async getBatchRun(@Req() request: FastifyRequest & { params: { batchRunId: string } }) {
    return {
      data: await this.batchService.getBatchRun(request.params.batchRunId)
    };
  }
}
