import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { AuthPrincipal, Prisma } from "@prisma/client";

import { AppConfigService } from "@/common/config/app-config.service";
import type { ActorType } from "@/common/domain/types";
import { AppException } from "@/common/errors/app-exception";
import type { RequestContext } from "@/common/http/request-context";
import { PrismaService } from "@/common/prisma/prisma.service";
import { AuditService } from "@/modules/audit/audit.service";
import type {
  AuthLoginRequest,
  AuthLogoutRequest,
  AuthRefreshRequest
} from "@/modules/auth/auth.schemas";
import type { JwtPayload } from "@/common/auth/jwt-payload";
import { OidcIdentityVerifier } from "@/common/auth/oidc-identity-verifier";
import { PasswordHasher } from "@/common/auth/password-hasher";
import { createOpaqueToken, hashOpaqueToken } from "@/common/auth/token-hasher";

interface LoadedPrincipal extends AuthPrincipal {
  roleBindings: Array<{ role: string }>;
}

@Injectable()
export class AuthIdentityService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(AppConfigService) private readonly config: AppConfigService,
    @Inject(PasswordHasher) private readonly passwordHasher: PasswordHasher,
    @Inject(OidcIdentityVerifier) private readonly oidcIdentityVerifier: OidcIdentityVerifier,
    @Inject(AuditService) private readonly auditService: AuditService
  ) {}

  async login(input: AuthLoginRequest, context: RequestContext) {
    if (input.grantType === "password") {
      if (input.audience !== this.config.authCustomerAudience) {
        throw new AppException(422, "invalid_audience", "Password logins are only allowed for the customer audience.");
      }

      const principal = await this.prisma.authPrincipal.findUnique({
        where: {
          loginId: input.loginId
        },
        include: {
          credentials: true,
          roleBindings: true
        }
      });

      if (!principal || principal.actorType !== "CUSTOMER") {
        throw new AppException(401, "invalid_credentials", "Invalid login credentials.");
      }

      this.assertActivePrincipal(principal);

      const passwordCredential = principal.credentials.find((credential) => credential.type === "PASSWORD");
      if (!passwordCredential || !this.passwordHasher.verify(input.secret, passwordCredential.secretHash)) {
        throw new AppException(401, "invalid_credentials", "Invalid login credentials.");
      }

      const response = await this.issueSessionTokens(principal, principal.roleBindings.map((binding) => binding.role), input.audience);

      await this.auditService.record(context, {
        actionType: "auth.login",
        resourceType: "auth_principal",
        resourceId: principal.id,
        metadata: {
          audience: input.audience,
          grantType: input.grantType
        }
      });

      return response;
    }

    if (input.audience !== this.config.authOperatorAudience) {
      throw new AppException(422, "invalid_audience", "Token exchange is only allowed for the operator audience.");
    }

    const externalIdentity = await this.oidcIdentityVerifier.verifySubjectToken(input.subjectToken);
    const mappedIdentity = await this.prisma.externalIdentity.findUnique({
      where: {
        issuer_subject: {
          issuer: externalIdentity.issuer,
          subject: externalIdentity.subject
        }
      },
      include: {
        principal: {
          include: {
            roleBindings: true
          }
        }
      }
    });

    if (!mappedIdentity) {
      throw new AppException(403, "external_identity_not_mapped", "External identity is not mapped to an operator principal.");
    }

    this.assertActivePrincipal(mappedIdentity.principal);

    const response = await this.issueSessionTokens(
      mappedIdentity.principal,
      mappedIdentity.principal.roleBindings.map((binding) => binding.role),
      input.audience
    );

    await this.auditService.record(context, {
      actionType: "auth.login",
      resourceType: "auth_principal",
      resourceId: mappedIdentity.principal.id,
      metadata: {
        audience: input.audience,
        grantType: input.grantType,
        issuer: externalIdentity.issuer
      }
    });

    return response;
  }

  async refresh(input: AuthRefreshRequest, context: RequestContext) {
    const hashedToken = hashOpaqueToken(input.refreshToken);
    const existingToken = await this.prisma.refreshToken.findUnique({
      where: {
        tokenHash: hashedToken
      },
      include: {
        session: {
          include: {
            principal: {
              include: {
                roleBindings: true
              }
            }
          }
        }
      }
    });

    if (!existingToken) {
      throw new AppException(401, "invalid_refresh_token", "Refresh token is invalid or expired.");
    }

    if (existingToken.revokedAt || existingToken.replacedByTokenId) {
      await this.revokeSession(existingToken.sessionId);
      throw new AppException(401, "refresh_token_replayed", "Refresh token has already been used.");
    }

    if (existingToken.expiresAt <= new Date()) {
      await this.expireSession(existingToken.sessionId);
      throw new AppException(401, "refresh_token_expired", "Refresh token is invalid or expired.");
    }

    this.assertActiveSession(existingToken.session);
    this.assertActivePrincipal(existingToken.session.principal);

    const result = await this.prisma.$transaction(async (tx) => {
      const principal = await tx.authPrincipal.findUnique({
        where: {
          id: existingToken.session.principalId
        },
        include: {
          roleBindings: true
        }
      });

      if (!principal) {
        throw new AppException(401, "invalid_refresh_token", "Refresh token is invalid or expired.");
      }

      const issuedTokens = await this.createTokensForSession(
        tx,
        principal,
        principal.roleBindings.map((binding) => binding.role),
        existingToken.sessionId,
        existingToken.session.audience,
        existingToken.session.refreshExpiresAt
      );

      await tx.refreshToken.update({
        where: {
          id: existingToken.id
        },
        data: {
          revokedAt: new Date(),
          replacedByTokenId: issuedTokens.refreshTokenId
        }
      });

      await tx.authSession.update({
        where: {
          id: existingToken.sessionId
        },
        data: {
          lastRefreshedAt: new Date()
        }
      });

      return issuedTokens.response;
    });

    await this.auditService.record(context, {
      actionType: "auth.refreshed",
      resourceType: "auth_session",
      resourceId: existingToken.sessionId,
      metadata: {
        audience: existingToken.session.audience
      }
    });

    return result;
  }

  async logout(input: AuthLogoutRequest, context: RequestContext) {
    const hashedToken = hashOpaqueToken(input.refreshToken);
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: {
        tokenHash: hashedToken
      },
      include: {
        session: true
      }
    });

    if (!refreshToken) {
      return {
        loggedOut: true
      };
    }

    await this.revokeSession(refreshToken.sessionId);

    await this.auditService.record(context, {
      actionType: "auth.logout",
      resourceType: "auth_session",
      resourceId: refreshToken.sessionId
    });

    return {
      loggedOut: true
    };
  }

  async authenticateAccessToken(token: string) {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.config.jwtSecret,
        issuer: this.config.authInternalIssuer
      });
    } catch {
      throw new AppException(401, "invalid_token", "Bearer token is invalid or expired.");
    }

    const session = await this.prisma.authSession.findUnique({
      where: {
        id: payload.sid
      },
      include: {
        principal: {
          include: {
            roleBindings: true
          }
        }
      }
    });

    if (!session) {
      throw new AppException(401, "invalid_token", "Bearer token is invalid or expired.");
    }

    this.assertActiveSession(session);
    this.assertActivePrincipal(session.principal);

    const roles = session.principal.roleBindings.map((binding) => binding.role).sort();
    const payloadRoles = [...payload.roles].sort();

    if (
      payload.pid !== session.principalId ||
      payload.sub !== session.principal.actorId ||
      payload.actorType !== session.principal.actorType ||
      payload.aud !== session.audience ||
      JSON.stringify(roles) !== JSON.stringify(payloadRoles)
    ) {
      throw new AppException(403, "forbidden", "The authenticated actor does not have permission for this action.");
    }

    return {
      actor: {
        actorId: session.principal.actorId,
        actorType: session.principal.actorType as ActorType,
        roles
      },
      audience: session.audience
    };
  }

  private async issueSessionTokens(principal: LoadedPrincipal, roles: string[], audience: string) {
    return this.prisma.$transaction(async (tx) => {
      const refreshExpiresAt = new Date(Date.now() + this.config.authRefreshTtlSeconds * 1000);

      const session = await tx.authSession.create({
        data: {
          principalId: principal.id,
          audience,
          issuer: this.config.authInternalIssuer,
          refreshExpiresAt
        }
      });

      const issuedTokens = await this.createTokensForSession(tx, principal, roles, session.id, audience, refreshExpiresAt);
      return issuedTokens.response;
    });
  }

  private async createTokensForSession(
    tx: Prisma.TransactionClient,
    principal: LoadedPrincipal,
    roles: string[],
    sessionId: string,
    audience: string,
    refreshExpiresAt: Date
  ) {
    const refreshToken = createOpaqueToken();
    const refreshRecord = await tx.refreshToken.create({
      data: {
        sessionId,
        tokenHash: hashOpaqueToken(refreshToken),
        expiresAt: refreshExpiresAt
      }
    });

    const payload: JwtPayload = {
      sub: principal.actorId,
      pid: principal.id,
      actorType: principal.actorType as ActorType,
      roles,
      aud: audience,
      iss: this.config.authInternalIssuer,
      sid: sessionId,
      jti: crypto.randomUUID()
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.jwtSecret,
      expiresIn: `${this.config.authAccessTtlSeconds}s`
    });

    return {
      refreshTokenId: refreshRecord.id,
      response: {
        data: {
          accessToken,
          refreshToken,
          tokenType: "Bearer",
          expiresInSeconds: this.config.authAccessTtlSeconds,
          principal: {
            principalId: principal.id,
            actorId: principal.actorId,
            actorType: principal.actorType,
            roles,
            audience
          }
        }
      }
    };
  }

  private assertActivePrincipal(principal: { status: string }) {
    if (principal.status !== "ACTIVE") {
      throw new AppException(403, "principal_disabled", "Principal is disabled.");
    }
  }

  private assertActiveSession(session: { status: string; revokedAt: Date | null }) {
    if (session.status !== "ACTIVE" || session.revokedAt) {
      throw new AppException(401, "invalid_token", "Bearer token is invalid or expired.");
    }
  }

  private async revokeSession(sessionId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.authSession.updateMany({
        where: {
          id: sessionId,
          status: "ACTIVE"
        },
        data: {
          status: "REVOKED",
          revokedAt: new Date()
        }
      });

      await tx.refreshToken.updateMany({
        where: {
          sessionId,
          revokedAt: null
        },
        data: {
          revokedAt: new Date()
        }
      });
    });
  }

  private async expireSession(sessionId: string) {
    await this.prisma.authSession.updateMany({
      where: {
        id: sessionId,
        status: "ACTIVE"
      },
      data: {
        status: "EXPIRED"
      }
    });
  }
}
