import { describe, expect, it, vi } from "vitest";

import { AuthProvisioningService } from "@/modules/auth/auth-provisioning.service";

describe("AuthProvisioningService", () => {
  const context = {
    correlationId: "corr-1",
    actor: {
      actorId: "admin-1",
      actorType: "ADMIN" as const,
      roles: ["ADMIN"]
    }
  };

  it("provisions a principal with roles and records an audit event", async () => {
    const record = vi.fn().mockResolvedValue(undefined);
    const service = new AuthProvisioningService(
      {
        authPrincipal: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({
            id: "principal-1",
            actorType: "OPS",
            actorId: "ops-user-1",
            loginId: "ops-user-1",
            status: "ACTIVE"
          })
        },
        roleBinding: {
          createMany: vi.fn().mockResolvedValue({ count: 2 }),
          findMany: vi.fn().mockResolvedValue([{ role: "OPS" }, { role: "AUDITOR" }])
        },
        $transaction: vi.fn((callback) => callback({
          authPrincipal: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue({
              id: "principal-1",
              actorType: "OPS",
              actorId: "ops-user-1",
              loginId: "ops-user-1",
              status: "ACTIVE"
            })
          },
          roleBinding: {
            createMany: vi.fn().mockResolvedValue({ count: 2 }),
            findMany: vi.fn().mockResolvedValue([{ role: "OPS" }, { role: "AUDITOR" }])
          }
        }))
      } as never,
      {
        record: record
      } as never
    );

    const result = await service.provisionPrincipal(
      {
        actorType: "OPS",
        actorId: "ops-user-1",
        loginId: "ops-user-1",
        roles: ["OPS", "AUDITOR"]
      },
      context
    );

    expect(result.roles).toEqual(["AUDITOR", "OPS"]);
    expect(record).toHaveBeenCalled();
  });

  it("maps an external identity and records an audit event", async () => {
    const record = vi.fn().mockResolvedValue(undefined);
    const service = new AuthProvisioningService(
      {
        $transaction: vi.fn((callback) => callback({
          authPrincipal: {
            findUnique: vi.fn().mockResolvedValue({
              id: "principal-1",
              actorType: "OPS",
              actorId: "ops-user-1"
            })
          },
          externalIdentity: {
            upsert: vi.fn().mockResolvedValue({
              issuer: "https://issuer.example.com",
              subject: "subject-1"
            })
          }
        }))
      } as never,
      {
        record
      } as never
    );

    const result = await service.mapExternalIdentity(
      {
        principalId: "principal-1",
        issuer: "https://issuer.example.com",
        subject: "subject-1"
      },
      context
    );

    expect(result).toEqual({
      principalId: "principal-1",
      issuer: "https://issuer.example.com",
      subject: "subject-1"
    });
    expect(record).toHaveBeenCalled();
  });
});
