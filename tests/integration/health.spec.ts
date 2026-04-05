import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createTestApp, type TestApp } from "../support/create-test-app";

describe("health endpoints", () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    if (testApp) {
      await testApp.close();
    }
  });

  it("serves the live health endpoint with correlation metadata", async () => {
    const response = await testApp.request.get("/api/v1/health/live");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        status: "ok"
      }
    });
    expect(response.headers["x-correlation-id"]).toEqual(expect.any(String));
  });
});
