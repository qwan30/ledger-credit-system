import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import type { FastifyRequest } from "fastify";

import { IS_PUBLIC_KEY } from "@/common/auth/public.decorator";
import type { JwtPayload } from "@/common/auth/jwt-payload";
import { AppConfigService } from "@/common/config/app-config.service";
import { AppException } from "@/common/errors/app-exception";
import { getRequestContext } from "@/common/http/request-context";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService
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
    const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.config.jwtSecret
    });

    const requestContext = getRequestContext(request);
    requestContext.actor = {
      actorId: payload.sub,
      actorType: payload.actorType,
      roles: payload.roles
    };

    return true;
  }
}
