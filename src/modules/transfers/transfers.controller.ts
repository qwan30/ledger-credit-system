import { Controller, Get, Post, Req, Res } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";

import { Roles } from "@/common/auth/roles.decorator";
import { parseSchema } from "@/common/http/parse-schema";
import { getRequestContext } from "@/common/http/request-context";
import { createTransferSchema } from "@/modules/transfers/transfers.schemas";
import { TransfersService } from "@/modules/transfers/transfers.service";

@Controller("transfers")
@Roles("CUSTOMER", "OPS", "ADMIN")
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  async createTransfer(@Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    const input = parseSchema(createTransferSchema, request.body);
    const result = await this.transfersService.createTransfer(input, getRequestContext(request));

    reply.status(result.statusCode);
    return result.body;
  }

  @Get(":transferRequestId")
  async getTransfer(@Req() request: FastifyRequest & { params: { transferRequestId: string } }) {
    return {
      data: await this.transfersService.getTransferById(request.params.transferRequestId, getRequestContext(request))
    };
  }
}
