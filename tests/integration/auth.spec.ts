/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createTestApp, type TestApp } from "../support/create-test-app";
import { bearerToken, issueAccessToken, signTestToken } from "../support/auth";
import { truncateApplicationTables } from "../support/db";
import { seedDemoData } from "../support/fixtures";
import { createJwksServer } from "../support/jwks-server";
import { demoData } from "../../prisma/seed-data";

describe("auth flows", () => {
  let testApp: TestApp;
  let jwksServer: Awaited<ReturnType<typeof createJwksServer>>;
  let adminAuthorization: string;

  beforeAll(async () => {
    jwksServer = await createJwksServer();
    process.env.AUTH_OIDC_ISSUER = jwksServer.issuer;
    process.env.AUTH_OIDC_JWKS_URI = jwksServer.jwksUri;
    process.env.AUTH_OIDC_AUDIENCE = jwksServer.audience;
    testApp = await createTestApp();
  });

  beforeEach(async () => {
    await truncateApplicationTables(testApp.prisma);
    await seedDemoData(testApp.prisma);
    adminAuthorization = bearerToken(
      await issueAccessToken(testApp.prisma, {
        actorId: "admin-user-1",
        actorType: "ADMIN",
        roles: ["ADMIN"],
        audience: "ops-api"
      })
    );
  });

  afterAll(async () => {
    if (testApp) {
      await testApp.close();
    }

    if (jwksServer) {
      await jwksServer.close();
    }
  });

  it("logs in a customer, rotates refresh tokens, and revokes the session on logout", async () => {
    const login = await testApp.request.post("/api/v1/auth/login").send({
      grantType: "password",
      audience: "customer-api",
      loginId: demoData.customerLoginId,
      secret: demoData.customerSecret
    });

    expect(login.status).toBe(201);
    expect(login.body.data.principal.actorType).toBe("CUSTOMER");

    const refresh = await testApp.request.post("/api/v1/auth/refresh").send({
      refreshToken: login.body.data.refreshToken
    });

    expect(refresh.status).toBe(201);
    expect(refresh.body.data.refreshToken).not.toBe(login.body.data.refreshToken);

    const replay = await testApp.request.post("/api/v1/auth/refresh").send({
      refreshToken: login.body.data.refreshToken
    });

    expect(replay.status).toBe(401);
    expect(replay.body.error.code).toBe("refresh_token_replayed");

    const logout = await testApp.request.post("/api/v1/auth/logout").send({
      refreshToken: refresh.body.data.refreshToken
    });

    expect(logout.status).toBe(200);
    expect(logout.body.data.loggedOut).toBe(true);

    const afterLogout = await testApp.request.post("/api/v1/auth/refresh").send({
      refreshToken: refresh.body.data.refreshToken
    });

    expect(afterLogout.status).toBe(401);
  });

  it("rejects forged audience and role escalation against a live session", async () => {
    const login = await testApp.request.post("/api/v1/auth/login").send({
      grantType: "password",
      audience: "customer-api",
      loginId: demoData.customerLoginId,
      secret: demoData.customerSecret
    });

    const principal = await testApp.prisma.authPrincipal.findUniqueOrThrow({
      where: {
        loginId: demoData.customerLoginId
      }
    });
    const session = await testApp.prisma.authSession.findFirstOrThrow({
      where: {
        principalId: principal.id,
        status: "ACTIVE"
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const forgedAudienceToken = signTestToken({
      actorId: principal.actorId,
      principalId: principal.id,
      actorType: "CUSTOMER",
      roles: ["CUSTOMER"],
      audience: "ops-api",
      sessionId: session.id
    });

    const forgedRoleToken = signTestToken({
      actorId: principal.actorId,
      principalId: principal.id,
      actorType: "CUSTOMER",
      roles: ["ADMIN"],
      audience: "customer-api",
      sessionId: session.id
    });

    const [wrongAudience, roleEscalation, legitimateCustomer] = await Promise.all([
      testApp.request
        .get("/api/v1/ops/audit-events")
        .set("Authorization", bearerToken(forgedAudienceToken)),
      testApp.request
        .get(`/api/v1/accounts/${demoData.checkingAccountId}/balance`)
        .set("Authorization", bearerToken(forgedRoleToken)),
      testApp.request
        .get(`/api/v1/accounts/${demoData.checkingAccountId}/balance`)
        .set("Authorization", bearerToken(login.body.data.accessToken))
    ]);

    expect(wrongAudience.status).toBe(403);
    expect(roleEscalation.status).toBe(403);
    expect(legitimateCustomer.status).toBe(200);
  });

  it("maps an external operator identity through JWKS token exchange", async () => {
    const principalProvision = await testApp.request
      .post("/api/v1/auth/admin/principals")
      .set("Authorization", adminAuthorization)
      .send({
        actorType: "OPS",
        actorId: "ops-user-oidc",
        loginId: "ops-user-oidc",
        roles: ["OPS"]
      });

    expect(principalProvision.status).toBe(201);

    const mapping = await testApp.request
      .post("/api/v1/auth/admin/external-identities")
      .set("Authorization", adminAuthorization)
      .send({
        principalId: principalProvision.body.data.principalId,
        issuer: jwksServer.issuer,
        subject: "oidc-ops-1"
      });

    expect(mapping.status).toBe(201);

    const subjectToken = await jwksServer.signSubjectToken("oidc-ops-1");
    const login = await testApp.request.post("/api/v1/auth/login").send({
      grantType: "token-exchange",
      audience: "ops-api",
      subjectToken
    });

    expect(login.status).toBe(201);
    expect(login.body.data.principal.actorType).toBe("OPS");
    expect(login.body.data.principal.roles).toContain("OPS");

    const opsTransferView = await testApp.request
      .get("/api/v1/ops/audit-events")
      .set("Authorization", bearerToken(login.body.data.accessToken));

    expect(opsTransferView.status).toBe(200);
  });
});
