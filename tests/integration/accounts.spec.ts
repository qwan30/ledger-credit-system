/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createTestApp, type TestApp } from "../support/create-test-app";
import { bearerToken, issueAccessToken } from "../support/auth";
import { truncateApplicationTables } from "../support/db";
import { createCustomerWithAccount, seedDemoData, type SeededDemoData } from "../support/fixtures";

describe("account reads", () => {
  let testApp: TestApp;
  let seeded: SeededDemoData;
  let customerAuthorization: string;

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
  });

  afterAll(async () => {
    if (testApp) {
      await testApp.close();
    }
  });

  it("returns balance data and records an audit event", async () => {
    const response = await testApp.request
      .get(`/api/v1/accounts/${seeded.checkingAccountId}/balance`)
      .set("Authorization", customerAuthorization);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        accountId: seeded.checkingAccountId,
        amount: {
          currency: "USD",
          minorUnits: 250_000
        },
        status: "ACTIVE"
      }
    });

    const auditEvent = await testApp.prisma.auditEvent.findFirst({
      where: {
        actionType: "account.balance_viewed",
        resourceId: seeded.checkingAccountId,
        actorId: seeded.customerId
      }
    });
    expect(auditEvent).not.toBeNull();
  });

  it("prevents a customer from reading another customer's account", async () => {
    const otherCustomer = await createCustomerWithAccount(testApp.prisma);

    const response = await testApp.request
      .get(`/api/v1/accounts/${otherCustomer.accountId}/balance`)
      .set("Authorization", customerAuthorization);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("forbidden");
  });
});
