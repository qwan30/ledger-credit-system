import { Controller, Get, Query, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { Roles } from "@/common/auth/roles.decorator";
import { getRequestContext } from "@/common/http/request-context";
import { AccountsService } from "@/modules/accounts/accounts.service";

@Controller("accounts")
@Roles("CUSTOMER", "OPS", "AUDITOR", "ADMIN")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get(":accountId/balance")
  async getBalance(@Req() request: FastifyRequest & { params: { accountId: string } }) {
    return {
      data: await this.accountsService.getBalance(request.params.accountId, getRequestContext(request))
    };
  }

  @Get(":accountId/ledger-entries")
  async getLedgerEntries(
    @Req() request: FastifyRequest & { params: { accountId: string } },
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string
  ) {
    const result = await this.accountsService.getLedgerEntries(
      request.params.accountId,
      getRequestContext(request),
      cursor,
      limit ? Number(limit) : undefined
    );

    return {
      data: result.items,
      meta: {
        nextCursor: result.nextCursor
      }
    };
  }
}
