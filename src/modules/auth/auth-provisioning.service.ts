import { Inject, Injectable } from "@nestjs/common";

import { assertAuthenticated } from "@/common/auth/authorization";
import { AppException } from "@/common/errors/app-exception";
import type { RequestContext } from "@/common/http/request-context";
import { PrismaService } from "@/common/prisma/prisma.service";
import { AuditService } from "@/modules/audit/audit.service";
import type {
  MapExternalIdentityRequest,
  ProvisionPrincipalRequest,
  ProvisionRoleBindingRequest
} from "@/modules/auth/auth.schemas";

@Injectable()
export class AuthProvisioningService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly auditService: AuditService
  ) {}

  async provisionPrincipal(input: ProvisionPrincipalRequest, context: RequestContext) {
    assertAuthenticated(context);

    const provisioned = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.authPrincipal.findFirst({
        where: {
          OR: [
            {
              actorType: input.actorType as never,
              actorId: input.actorId
            },
            ...(input.loginId ? [{ loginId: input.loginId }] : []),
            ...(input.customerId ? [{ customerId: input.customerId }] : [])
          ]
        }
      });

      const principal = existing
        ? await tx.authPrincipal.update({
            where: {
              id: existing.id
            },
            data: {
              actorType: input.actorType as never,
              actorId: input.actorId,
              status: "ACTIVE",
              ...(input.loginId ? { loginId: input.loginId } : {}),
              ...(input.customerId ? { customerId: input.customerId } : {})
            }
          })
        : await tx.authPrincipal.create({
            data: {
              actorType: input.actorType as never,
              actorId: input.actorId,
              status: "ACTIVE",
              ...(input.loginId ? { loginId: input.loginId } : {}),
              ...(input.customerId ? { customerId: input.customerId } : {})
            }
          });

      await tx.roleBinding.createMany({
        data: input.roles.map((role) => ({
          principalId: principal.id,
          role
        })),
        skipDuplicates: true
      });

      const roles = await tx.roleBinding.findMany({
        where: {
          principalId: principal.id
        },
        select: {
          role: true
        }
      });

      return {
        principalId: principal.id,
        actorType: principal.actorType,
        actorId: principal.actorId,
        loginId: principal.loginId,
        status: principal.status,
        roles: roles.map((binding) => binding.role).sort()
      };
    });

    await this.auditService.record(context, {
      actionType: "auth.principal_provisioned",
      resourceType: "auth_principal",
      resourceId: provisioned.principalId,
      metadata: {
        actorType: provisioned.actorType,
        actorId: provisioned.actorId,
        roles: provisioned.roles
      }
    });

    return provisioned;
  }

  async provisionRoleBinding(input: ProvisionRoleBindingRequest, context: RequestContext) {
    assertAuthenticated(context);

    await this.prisma.roleBinding.createMany({
      data: [
        {
          principalId: input.principalId,
          role: input.role
        }
      ],
      skipDuplicates: true
    });

    await this.auditService.record(context, {
      actionType: "auth.role_bound",
      resourceType: "auth_principal",
      resourceId: input.principalId,
      metadata: {
        role: input.role
      }
    });

    return {
      principalId: input.principalId,
      role: input.role
    };
  }

  async mapExternalIdentity(input: MapExternalIdentityRequest, context: RequestContext) {
    assertAuthenticated(context);

    const mapping = await this.prisma.$transaction(async (tx) => {
      const principal = await tx.authPrincipal.findUnique({
        where: {
          id: input.principalId
        }
      });

      if (!principal) {
        throw new AppException(404, "auth_principal_not_found", "Auth principal was not found.");
      }

      const externalIdentity = await tx.externalIdentity.upsert({
        where: {
          issuer_subject: {
            issuer: input.issuer,
            subject: input.subject
          }
        },
        update: {
          principalId: input.principalId
        },
        create: {
          principalId: input.principalId,
          issuer: input.issuer,
          subject: input.subject
        }
      });

      return {
        principalId: input.principalId,
        issuer: externalIdentity.issuer,
        subject: externalIdentity.subject
      };
    });

    await this.auditService.record(context, {
      actionType: "auth.external_identity_mapped",
      resourceType: "auth_principal",
      resourceId: input.principalId,
      metadata: {
        issuer: input.issuer,
        subject: input.subject
      }
    });

    return mapping;
  }
}
