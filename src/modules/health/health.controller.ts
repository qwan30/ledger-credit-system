import { Controller, Get } from "@nestjs/common";

import { Public } from "@/common/auth/public.decorator";

@Controller("health")
export class HealthController {
  @Public()
  @Get("live")
  live() {
    return {
      data: {
        status: "ok"
      }
    };
  }

  @Public()
  @Get("ready")
  ready() {
    return {
      data: {
        status: "ready"
      }
    };
  }
}
