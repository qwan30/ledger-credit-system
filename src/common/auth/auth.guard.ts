import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { FastifyRequest } from "fastify";

import { AuthIdentityService } from "@/common/auth/auth-identity.service";
import { IS_PUBLIC_KEY } from "@/common/auth/public.decorator";
import { AppException } from "@/common/errors/app-exception";
import { getRequestContext } from "@/common/http/request-context";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(AuthIdentityService) private readonly authIdentityService: AuthIdentityService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader?.startsWith("Bearer ")) {
      throw new AppException(401, "unauthenticated", "Missing or invalid bearer token.");
    }

    const token = authorizationHeader.replace("Bearer ", "");
    const authenticated = await this.authIdentityService.authenticateAccessToken(token);

    const requestContext = getRequestContext(request);
    requestContext.actor = authenticated.actor;

    return true;
  }
}
