import { Controller, Get, Inject, Post, Req, Res } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";

import { Roles } from "@/common/auth/roles.decorator";
import { parseSchema } from "@/common/http/parse-schema";
import { getRequestContext } from "@/common/http/request-context";
import { createCreditAssessmentSchema } from "@/modules/credit/credit.schemas";
import { CreditService } from "@/modules/credit/credit.service";

@Controller("credit-assessments")
@Roles("CUSTOMER", "ANALYST", "AUDITOR", "ADMIN")
export class CreditController {
  constructor(@Inject(CreditService) private readonly creditService: CreditService) {}

  @Post()
  async createAssessment(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    const input = parseSchema(createCreditAssessmentSchema, request.body);
    const result = await this.creditService.createAssessment(input, getRequestContext(request));

    reply.status(result.statusCode);
    return result.body;
  }

  @Get(":creditAssessmentId")
  async getAssessment(@Req() request: FastifyRequest & { params: { creditAssessmentId: string } }) {
    return {
      data: await this.creditService.getAssessmentById(request.params.creditAssessmentId, getRequestContext(request))
    };
  }
}
