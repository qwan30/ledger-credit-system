import { JwtService } from "@nestjs/jwt";
import type { PrismaClient } from "@prisma/client";

import type { ActorType } from "@/common/domain/types";

import { ensureTestEnvironment } from "./test-env";

ensureTestEnvironment();

export interface TestTokenInput {
  actorId: string;
  actorType: ActorType;
  roles: string[];
  audience?: string;
  issuer?: string;
  sessionId?: string;
  tokenId?: string;
  principalId?: string;
  expiresInSeconds?: number;
}

const jwtService = new JwtService({
  secret: process.env.JWT_SECRET!,
  signOptions: {
    algorithm: "HS256"
  }
});

export function signTestToken(input: TestTokenInput): string {
  return jwtService.sign(
    {
      sub: input.actorId,
      pid: input.principalId ?? input.actorId,
      actorType: input.actorType,
      roles: input.roles,
      aud: input.audience ?? "customer-api",
      iss: input.issuer ?? process.env.AUTH_INTERNAL_ISSUER ?? "ledger-credit-system",
      sid: input.sessionId ?? crypto.randomUUID(),
      jti: input.tokenId ?? crypto.randomUUID()
    },
    {
      expiresIn: `${input.expiresInSeconds ?? 900}s`
    }
  );
}

export function bearerToken(token: string): string {
  return `Bearer ${token}`;
}

export async function issueAccessToken(
  prisma: PrismaClient,
  input: TestTokenInput
): Promise<string> {
  const existingPrincipal =
    input.actorType === "CUSTOMER"
      ? await prisma.authPrincipal.findUnique({
          where: {
            customerId: input.actorId
          }
        })
      : await prisma.authPrincipal.findFirst({
          where: {
            actorType: input.actorType as never,
            actorId: input.actorId
          }
        });

  const principal = existingPrincipal
    ? await prisma.authPrincipal.update({
        where: {
          id: existingPrincipal.id
        },
        data: {
          status: "ACTIVE"
        }
      })
    : await prisma.authPrincipal.create({
        data: {
          id: input.principalId ?? crypto.randomUUID(),
          actorType: input.actorType as never,
          actorId: input.actorId,
          ...(input.actorType === "CUSTOMER" ? { customerId: input.actorId } : {}),
          status: "ACTIVE"
        }
      });

  await prisma.roleBinding.createMany({
    data: input.roles.map((role) => ({
      principalId: principal.id,
      role
    })),
    skipDuplicates: true
  });

  const session = await prisma.authSession.create({
    data: {
      id: input.sessionId ?? crypto.randomUUID(),
      principalId: principal.id,
      audience: input.audience ?? "customer-api",
      issuer: input.issuer ?? "ledger-credit-system",
      refreshExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return signTestToken({
    ...input,
    principalId: principal.id,
    sessionId: session.id
  });
}

export async function mapExternalIdentity(
  prisma: PrismaClient,
  input: {
    actorId: string;
    actorType: ActorType;
    roles: string[];
    issuer: string;
    subject: string;
  }
) {
  const principal =
    (await prisma.authPrincipal.findFirst({
      where: {
        actorType: input.actorType as never,
        actorId: input.actorId
      }
    })) ??
    (await prisma.authPrincipal.create({
      data: {
        actorType: input.actorType as never,
        actorId: input.actorId,
        status: "ACTIVE"
      }
    }));

  await prisma.roleBinding.createMany({
    data: input.roles.map((role) => ({
      principalId: principal.id,
      role
    })),
    skipDuplicates: true
  });

  await prisma.externalIdentity.upsert({
    where: {
      issuer_subject: {
        issuer: input.issuer,
        subject: input.subject
      }
    },
    update: {
      principalId: principal.id
    },
    create: {
      principalId: principal.id,
      issuer: input.issuer,
      subject: input.subject
    }
  });

  return principal;
}
