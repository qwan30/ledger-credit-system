/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createTestApp, type TestApp } from "../support/create-test-app";
import { bearerToken, issueAccessToken } from "../support/auth";
import { truncateApplicationTables } from "../support/db";
import { seedDemoData, type SeededDemoData } from "../support/fixtures";
import { waitFor } from "../support/wait";

describe("transfer flows", () => {
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

  it("settles an internal transfer with exact balance changes and one journal effect", async () => {
    const response = await testApp.request
      .post("/api/v1/transfers")
      .set("Authorization", customerAuthorization)
      .set("Idempotency-Key", "transfer-internal-1")
      .send({
        sourceAccountId: seeded.checkingAccountId,
        destination: {
          type: "INTERNAL_ACCOUNT",
          accountId: seeded.savingsAccountId
        },
        amount: {
          currency: "USD",
          minorUnits: 2_500
        },
        purpose: "Savings top-up"
      });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("SETTLED");

    const [sourceBalance, destinationBalance, ledgerEntries] = await Promise.all([
      testApp.request
        .get(`/api/v1/accounts/${seeded.checkingAccountId}/balance`)
        .set("Authorization", customerAuthorization),
      testApp.request
        .get(`/api/v1/accounts/${seeded.savingsAccountId}/balance`)
        .set("Authorization", customerAuthorization),
      testApp.request
        .get(`/api/v1/accounts/${seeded.checkingAccountId}/ledger-entries`)
        .set("Authorization", customerAuthorization)
    ]);

    expect(sourceBalance.body.data.amount.minorUnits).toBe(247_500);
    expect(destinationBalance.body.data.amount.minorUnits).toBe(1_252_500);
    expect(ledgerEntries.body.data[0]).toMatchObject({
      sourceOperationType: "INTERNAL_TRANSFER",
      amount: {
        currency: "USD",
        minorUnits: 2_500
      },
      direction: "DEBIT",
      runningBalanceMinor: 247_500
    });

    const transferJournalEntries = await testApp.prisma.journalEntry.count({
      where: {
        transferRequestId: response.body.data.transferRequestId
      }
    });
    expect(transferJournalEntries).toBe(1);
  });

  it("replays the original transfer response and blocks conflicting payload reuse", async () => {
    const first = await testApp.request
      .post("/api/v1/transfers")
      .set("Authorization", customerAuthorization)
      .set("Idempotency-Key", "transfer-replay-1")
      .send({
        sourceAccountId: seeded.checkingAccountId,
        destination: {
          type: "INTERNAL_ACCOUNT",
          accountId: seeded.savingsAccountId
        },
        amount: {
          currency: "USD",
          minorUnits: 1_000
        }
      });

    const replay = await testApp.request
      .post("/api/v1/transfers")
      .set("Authorization", customerAuthorization)
      .set("Idempotency-Key", "transfer-replay-1")
      .send({
        sourceAccountId: seeded.checkingAccountId,
        destination: {
          type: "INTERNAL_ACCOUNT",
          accountId: seeded.savingsAccountId
        },
        amount: {
          currency: "USD",
          minorUnits: 1_000
        }
      });

    const conflict = await testApp.request
      .post("/api/v1/transfers")
      .set("Authorization", customerAuthorization)
      .set("Idempotency-Key", "transfer-replay-1")
      .send({
        sourceAccountId: seeded.checkingAccountId,
        destination: {
          type: "INTERNAL_ACCOUNT",
          accountId: seeded.savingsAccountId
        },
        amount: {
          currency: "USD",
          minorUnits: 2_000
        }
      });

    expect(replay.status).toBe(200);
    expect(replay.body).toEqual(first.body);
    expect(conflict.status).toBe(409);
    expect(conflict.body.error.code).toBe("idempotency_conflict");

    const transferCount = await testApp.prisma.transferRequest.count({
      where: {
        idempotencyKey: "transfer-replay-1"
      }
    });
    expect(transferCount).toBe(1);
  });

  it("settles external transfers asynchronously and compensates rejected submissions exactly once", async () => {
    const settled = await testApp.request
      .post("/api/v1/transfers")
      .set("Authorization", customerAuthorization)
      .set("Idempotency-Key", "external-ok-1")
      .send({
        sourceAccountId: seeded.checkingAccountId,
        destination: {
          type: "EXTERNAL_BANK",
          bankCode: "BANK01",
          accountNumber: "12345601",
          accountName: "Integration Beneficiary"
        },
        amount: {
          currency: "USD",
          minorUnits: 5_000
        }
      });

    expect(settled.status).toBe(202);

    const settledStatus = await waitFor(
      async () =>
        testApp.request
          .get(`/api/v1/transfers/${settled.body.data.transferRequestId}`)
          .set("Authorization", customerAuthorization),
      (response) => response.body.data.status === "SETTLED"
    );

    expect(settledStatus.body.data.status).toBe("SETTLED");

    const rejected = await testApp.request
      .post("/api/v1/transfers")
      .set("Authorization", customerAuthorization)
      .set("Idempotency-Key", "external-fail-1")
      .send({
        sourceAccountId: seeded.checkingAccountId,
        destination: {
          type: "EXTERNAL_BANK",
          bankCode: "BANK01",
          accountNumber: "12345699",
          accountName: "Integration Beneficiary"
        },
        amount: {
          currency: "USD",
          minorUnits: 7_500
        }
      });

    expect(rejected.status).toBe(202);

    const compensatedStatus = await waitFor(
      async () =>
        testApp.request
          .get(`/api/v1/transfers/${rejected.body.data.transferRequestId}`)
          .set("Authorization", customerAuthorization),
      (response) => response.body.data.status === "COMPENSATED"
    );

    expect(compensatedStatus.body.data.status).toBe("COMPENSATED");

    const checkingBalance = await testApp.request
      .get(`/api/v1/accounts/${seeded.checkingAccountId}/balance`)
      .set("Authorization", customerAuthorization);

    expect(checkingBalance.body.data.amount.minorUnits).toBe(245_000);

    const transferJournalEntries = await testApp.prisma.journalEntry.count({
      where: {
        transferRequestId: rejected.body.data.transferRequestId
      }
    });
    expect(transferJournalEntries).toBe(2);
  });

  it("ingests provider callbacks idempotently and allows ops reconciliation", async () => {
    const pendingTransfer = await testApp.prisma.transferRequest.create({
      data: {
        transferType: "INTERBANK",
        status: "PENDING_EXTERNAL",
        sourceAccountId: seeded.checkingAccountId,
        amountMinor: 4_000n,
        currency: "USD",
        idempotencyKey: "external-callback-1",
        requestHash: "external-callback-hash-1",
        correlationId: "corr-callback-1",
        externalReference: "sim_callback_1",
        externalRailProvider: "simulator",
        destinationExternalBankCode: "BANK01",
        destinationExternalAccountNumber: "12345601",
        destinationExternalAccountName: "Callback Beneficiary"
      }
    });

    const callback = await testApp.request
      .post("/api/v1/integrations/external-rails/simulator/events")
      .set("X-External-Rail-Secret", process.env.EXTERNAL_RAIL_CALLBACK_SECRET ?? "callback-secret")
      .send({
        providerEventId: "sim-event-1",
        externalReference: "sim_callback_1",
        status: "ACKNOWLEDGED"
      });

    const callbackReplay = await testApp.request
      .post("/api/v1/integrations/external-rails/simulator/events")
      .set("X-External-Rail-Secret", process.env.EXTERNAL_RAIL_CALLBACK_SECRET ?? "callback-secret")
      .send({
        providerEventId: "sim-event-1",
        externalReference: "sim_callback_1",
        status: "ACKNOWLEDGED"
      });

    expect(callback.status).toBe(202);
    expect(callbackReplay.status).toBe(202);

    const reconciled = await testApp.request
      .post(`/api/v1/ops/transfers/${pendingTransfer.id}/reconcile`)
      .set("Authorization", opsAuthorization);

    expect(reconciled.status).toBe(200);
    expect(reconciled.body.data.transferRequestId).toBe(pendingTransfer.id);
    expect(["PENDING_EXTERNAL", "SETTLED", "COMPENSATED"]).toContain(reconciled.body.data.status);
  });

  it("supports multiple external rail providers for outbound transfers", async () => {
    const response = await testApp.request
      .post("/api/v1/transfers")
      .set("Authorization", customerAuthorization)
      .set("Idempotency-Key", "external-mock-bank-1")
      .send({
        sourceAccountId: seeded.checkingAccountId,
        destination: {
          type: "EXTERNAL_BANK",
          provider: "mock-bank",
          bankCode: "BANK02",
          accountNumber: "87654321",
          accountName: "Mock Bank Beneficiary"
        },
        amount: {
          currency: "USD",
          minorUnits: 3_500
        }
      });

    expect(response.status).toBe(202);

    const settled = await waitFor(
      async () =>
        testApp.request
          .get(`/api/v1/transfers/${response.body.data.transferRequestId}`)
          .set("Authorization", customerAuthorization),
      (transferResponse) => transferResponse.body.data.status === "SETTLED"
    );

    expect(settled.body.data).toMatchObject({
      status: "SETTLED",
      externalRailProvider: "mock-bank"
    });
  });
});
