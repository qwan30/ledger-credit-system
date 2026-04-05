/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { BatchService } from "@/modules/batch/batch.service";

import { createTestApp, type TestApp } from "../support/create-test-app";
import { bearerToken, issueAccessToken } from "../support/auth";
import { truncateApplicationTables } from "../support/db";
import { seedDemoData, type SeededDemoData } from "../support/fixtures";

describe("batch flows", () => {
  let testApp: TestApp;
  let seeded: SeededDemoData;
  let opsAuthorization: string;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  beforeEach(async () => {
    await truncateApplicationTables(testApp.prisma);
    seeded = await seedDemoData(testApp.prisma);
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

  it("exposes batch inspection over HTTP after a live run", async () => {
    const batchService = testApp.app.get(BatchService);
    const batchRunId = await batchService.runBatch("integration-test");

    const response = await testApp.request
      .get(`/api/v1/batch-runs/${batchRunId}`)
      .set("Authorization", opsAuthorization);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      batchRunId,
      batchType: "end-of-day-interest-close",
      status: "COMPLETED"
    });
    expect(response.body.data.processedCount).toBeGreaterThan(0);
  });

  it("retries failed batch items without duplicating the retry count", async () => {
    const batchRun = await testApp.prisma.batchRun.create({
      data: {
        batchType: "end-of-day-interest-close",
        status: "FAILED",
        scheduledFor: new Date(),
        startedAt: new Date(),
        correlationId: crypto.randomUUID()
      }
    });

    await testApp.prisma.batchRunItem.create({
      data: {
        batchRunId: batchRun.id,
        resourceType: "account",
        resourceId: seeded.checkingAccountId,
        shardKey: "0",
        status: "FAILED",
        lastError: "Synthetic failure"
      }
    });

    const firstRetry = await testApp.request
      .post(`/api/v1/ops/batch-runs/${batchRun.id}/retry`)
      .set("Authorization", opsAuthorization);

    const secondRetry = await testApp.request
      .post(`/api/v1/ops/batch-runs/${batchRun.id}/retry`)
      .set("Authorization", opsAuthorization);

    expect(firstRetry.status).toBe(200);
    expect(firstRetry.body.data.retriedCount).toBe(1);
    expect(secondRetry.status).toBe(200);
    expect(secondRetry.body.data.retriedCount).toBe(0);
  });
});
