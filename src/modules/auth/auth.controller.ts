import { Controller, HttpCode, Inject, Post, Req, Res } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";

import { AuthIdentityService } from "@/common/auth/auth-identity.service";
import { Public } from "@/common/auth/public.decorator";
import { Roles } from "@/common/auth/roles.decorator";
import { parseSchema } from "@/common/http/parse-schema";
import { getRequestContext } from "@/common/http/request-context";
import {
  authLoginSchema,
  authLogoutSchema,
  authRefreshSchema,
  mapExternalIdentitySchema,
  provisionPrincipalSchema,
  provisionRoleBindingSchema
} from "@/modules/auth/auth.schemas";
import { AuthProvisioningService } from "@/modules/auth/auth-provisioning.service";

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(AuthIdentityService) private readonly authIdentityService: AuthIdentityService,
    @Inject(AuthProvisioningService) private readonly authProvisioningService: AuthProvisioningService
  ) {}

  @Public()
  @Post("login")
  async login(@Req() request: FastifyRequest) {
    const input = parseSchema(authLoginSchema, request.body);
    return this.authIdentityService.login(input, getRequestContext(request));
  }

  @Public()
  @Post("refresh")
  async refresh(@Req() request: FastifyRequest) {
    const input = parseSchema(authRefreshSchema, request.body);
    return this.authIdentityService.refresh(input, getRequestContext(request));
  }

  @Public()
  @HttpCode(200)
  @Post("logout")
  async logout(@Req() request: FastifyRequest) {
    const input = parseSchema(authLogoutSchema, request.body);

    return {
      data: await this.authIdentityService.logout(input, getRequestContext(request))
    };
  }

  @Roles("ADMIN")
  @HttpCode(201)
  @Post("admin/principals")
  async provisionPrincipal(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    const input = parseSchema(provisionPrincipalSchema, request.body);
    reply.status(201);

    return {
      data: await this.authProvisioningService.provisionPrincipal(input, getRequestContext(request))
    };
  }

  @Roles("ADMIN")
  @HttpCode(201)
  @Post("admin/role-bindings")
  async provisionRoleBinding(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    const input = parseSchema(provisionRoleBindingSchema, request.body);
    reply.status(201);

    return {
      data: await this.authProvisioningService.provisionRoleBinding(input, getRequestContext(request))
    };
  }

  @Roles("ADMIN")
  @HttpCode(201)
  @Post("admin/external-identities")
  async mapExternalIdentity(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    const input = parseSchema(mapExternalIdentitySchema, request.body);
    reply.status(201);

    return {
      data: await this.authProvisioningService.mapExternalIdentity(input, getRequestContext(request))
    };
  }
}
