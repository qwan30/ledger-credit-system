/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createTestApp, type TestApp } from "../support/create-test-app";
import { bearerToken, issueAccessToken } from "../support/auth";
import { truncateApplicationTables } from "../support/db";
import { seedDemoData, type SeededDemoData } from "../support/fixtures";

describe("ops endpoints", () => {
  let testApp: TestApp;
  let seeded: SeededDemoData;
  let customerAuthorization: string;
  let opsAuthorization: string;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  beforeEach(async () => {
    await truncateApplicationTables(testApp.prisma);
    seeded = await seedDemoData(testApp.prisma);
    customerAuthorization = bearerToken(
      await issueAccessToken(testApp.prisma, {
        actorId: seeded.customerId,
        actorType: "CUSTOMER",
        roles: ["CUSTOMER"]
      })
    );
    opsAuthorization = bearerToken(
      await issueAccessToken(testApp.prisma, {
        actorId: "ops-user-1",
        actorType: "OPS",
        roles: ["OPS"],
        audience: "ops-api"
      })
    );
  });

  afterAll(async () => {
    if (testApp) {
      await testApp.close();
    }
  });

  it("blocks customer tokens from privileged ops endpoints", async () => {
    const response = await testApp.request
      .get("/api/v1/ops/audit-events")
      .set("Authorization", customerAuthorization);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("forbidden");
  });

  it("allows ops users to inspect transfers and related audit events", async () => {
    const transfer = await testApp.request
      .post("/api/v1/transfers")
      .set("Authorization", customerAuthorization)
      .set("Idempotency-Key", "ops-transfer-1")
      .send({
        sourceAccountId: seeded.checkingAccountId,
        destination: {
          type: "INTERNAL_ACCOUNT",
          accountId: seeded.savingsAccountId
        },
        amount: {
          currency: "USD",
          minorUnits: 1_500
        }
      });

    const [opsTransfer, auditEvents] = await Promise.all([
      testApp.request
        .get(`/api/v1/ops/transfers/${transfer.body.data.transferRequestId}`)
        .set("Authorization", opsAuthorization),
      testApp.request
        .get("/api/v1/ops/audit-events")
        .query({
          resourceType: "transfer_request",
          resourceId: transfer.body.data.transferRequestId
        })
        .set("Authorization", opsAuthorization)
    ]);

    expect(opsTransfer.status).toBe(200);
    expect(opsTransfer.body.data.transferRequestId).toBe(transfer.body.data.transferRequestId);
    expect(auditEvents.status).toBe(200);
    expect(auditEvents.body.data.length).toBeGreaterThan(0);
  });

  it("allows ops users to redrive pending external transfers and inspect external events", async () => {
    const pendingTransfer = await testApp.prisma.transferRequest.create({
      data: {
        transferType: "INTERBANK",
        status: "PENDING_EXTERNAL",
        sourceAccountId: seeded.checkingAccountId,
        amountMinor: 3_500n,
        currency: "USD",
        idempotencyKey: "ops-redrive-1",
        requestHash: "ops-redrive-hash-1",
        correlationId: "corr-redrive-1",
        externalReference: "sim_redrive_1",
        externalRailProvider: "simulator",
        destinationExternalBankCode: "BANK01",
        destinationExternalAccountNumber: "12345601",
        destinationExternalAccountName: "Ops Beneficiary"
      }
    });

    const redrive = await testApp.request
      .post(`/api/v1/ops/transfers/${pendingTransfer.id}/redrive`)
      .set("Authorization", opsAuthorization);

    expect(redrive.status).toBe(202);

    const events = await testApp.request
      .get(`/api/v1/ops/transfers/${pendingTransfer.id}/external-events`)
      .set("Authorization", opsAuthorization);

    expect(events.status).toBe(200);
    expect(events.body.data.length).toBeGreaterThan(0);
  });
});
