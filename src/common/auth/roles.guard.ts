import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { FastifyRequest } from "fastify";

import { ROLES_KEY } from "@/common/auth/roles.decorator";
import { AppException } from "@/common/errors/app-exception";
import { getRequestContext } from "@/common/http/request-context";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const requestContext = getRequestContext(request);
    const actorRoles = requestContext.actor?.roles ?? [];

    if (!requiredRoles.some((role) => actorRoles.includes(role))) {
      throw new AppException(403, "forbidden", "The authenticated actor does not have permission for this action.");
    }

    return true;
  }
}
