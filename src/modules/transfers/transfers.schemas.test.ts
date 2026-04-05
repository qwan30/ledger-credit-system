import { describe, expect, it } from "vitest";

import { createTransferSchema } from "@/modules/transfers/transfers.schemas";

describe("createTransferSchema", () => {
  it("accepts a valid internal transfer payload", () => {
    expect(
      createTransferSchema.parse({
        sourceAccountId: "11111111-1111-1111-1111-111111111111",
        destination: {
          type: "INTERNAL_ACCOUNT",
          accountId: "22222222-2222-2222-2222-222222222222"
        },
        amount: {
          currency: "usd",
          minorUnits: 100
        }
      })
    ).toMatchObject({
      amount: {
        currency: "USD"
      }
    });
  });

  it("rejects malformed transfer payloads", () => {
    expect(() =>
      createTransferSchema.parse({
        sourceAccountId: "bad",
        destination: {
          type: "INTERNAL_ACCOUNT",
          accountId: "bad"
        },
        amount: {
          currency: "USD",
          minorUnits: 10.5
        }
      })
    ).toThrow();
  });

  it("accepts an external transfer provider and normalizes it", () => {
    expect(
      createTransferSchema.parse({
        sourceAccountId: "11111111-1111-1111-1111-111111111111",
        destination: {
          type: "EXTERNAL_BANK",
          provider: " MOCK-BANK ",
          bankCode: "BANK01",
          accountNumber: "12345678",
          accountName: "Receiver"
        },
        amount: {
          currency: "usd",
          minorUnits: 2500
        }
      })
    ).toMatchObject({
      destination: {
        provider: "mock-bank"
      },
      amount: {
        currency: "USD"
      }
    });
  });
});
