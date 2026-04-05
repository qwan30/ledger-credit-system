import { Controller, HttpCode, Inject, Post, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { Public } from "@/common/auth/public.decorator";
import { ExternalRailService } from "@/modules/transfers/external-rail.service";

@Controller("integrations/external-rails")
export class ExternalRailController {
  constructor(@Inject(ExternalRailService) private readonly externalRailService: ExternalRailService) {}

  @Public()
  @HttpCode(202)
  @Post(":provider/events")
  async ingestProviderEvent(@Req() request: FastifyRequest & { params: { provider: string } }) {
    this.externalRailService.assertCallbackSecret(request.headers["x-external-rail-secret"]);

    return {
      data: await this.externalRailService.ingestProviderEvent(request.params.provider, request.body)
    };
  }
}
