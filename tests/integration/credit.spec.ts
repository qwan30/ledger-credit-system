/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createTestApp, type TestApp } from "../support/create-test-app";
import { bearerToken, issueAccessToken } from "../support/auth";
import { truncateApplicationTables } from "../support/db";
import { createCustomerWithAccount, seedDemoData, type SeededDemoData } from "../support/fixtures";

describe("credit assessments", () => {
  let testApp: TestApp;
  let seeded: SeededDemoData;
  let customerAuthorization: string;
  let analystAuthorization: string;

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
    analystAuthorization = bearerToken(
      await issueAccessToken(testApp.prisma, {
        actorId: "analyst-user-1",
        actorType: "ANALYST",
        roles: ["ANALYST"],
        audience: "ops-api"
      })
    );
  });

  afterAll(async () => {
    if (testApp) {
      await testApp.close();
    }
  });

  it("creates a credit assessment for manual review and allows privileged approval", async () => {
    const first = await testApp.request
      .post("/api/v1/credit-assessments")
      .set("Authorization", customerAuthorization)
      .set("Idempotency-Key", "credit-1")
      .send({
        customerId: seeded.customerId,
        requestedBy: "integration-test"
      });

    const replay = await testApp.request
      .post("/api/v1/credit-assessments")
      .set("Authorization", customerAuthorization)
      .set("Idempotency-Key", "credit-1")
      .send({
        customerId: seeded.customerId,
        requestedBy: "integration-test"
      });

    expect(first.status).toBe(202);
    expect(first.body.data.status).toBe("UNDER_REVIEW");
    expect(replay.status).toBe(202);
    expect(replay.body).toEqual(first.body);

    const approved = await testApp.request
      .post(`/api/v1/ops/credit-assessments/${first.body.data.creditAssessmentId}/approve`)
      .set("Authorization", analystAuthorization)
      .send({
        reviewRationale: "manual approval complete"
      });

    expect(approved.status).toBe(200);
    expect(approved.body.data.status).toBe("APPROVED");

    const detail = await testApp.request
      .get(`/api/v1/credit-assessments/${first.body.data.creditAssessmentId}`)
      .set("Authorization", customerAuthorization);

    expect(detail.status).toBe(200);
    expect(detail.body.data.customerId).toBe(seeded.customerId);
    expect(detail.body.data.score).toEqual(expect.any(Number));
    expect(detail.body.data.reviewDecision).toMatchObject({
      reviewedBy: {
        actorId: "analyst-user-1",
        actorType: "ANALYST"
      },
      rationale: "manual approval complete"
    });
  });

  it("blocks a customer from requesting another customer's assessment", async () => {
    const otherCustomer = await createCustomerWithAccount(testApp.prisma);

    const response = await testApp.request
      .post("/api/v1/credit-assessments")
      .set("Authorization", customerAuthorization)
      .set("Idempotency-Key", "credit-other")
      .send({
        customerId: otherCustomer.customerId,
        requestedBy: "integration-test"
      });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("forbidden");
  });
});
