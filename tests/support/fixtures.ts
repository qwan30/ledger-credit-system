import type { PrismaClient } from "@prisma/client";

import { seedBaseData } from "../../prisma/seed-data";

export interface SeededDemoData {
  customerId: string;
  checkingAccountId: string;
  savingsAccountId: string;
}

export async function seedDemoData(prisma: PrismaClient): Promise<SeededDemoData> {
  return seedBaseData(prisma);
}

export async function createCustomerWithAccount(prisma: PrismaClient): Promise<{
  customerId: string;
  accountId: string;
}> {
  const customer = await prisma.customer.create({
    data: {
      externalRef: `test-customer-${crypto.randomUUID()}`,
      status: "ACTIVE"
    }
  });

  const account = await prisma.account.create({
    data: {
      customerId: customer.id,
      type: "CHECKING",
      currency: "USD",
      status: "ACTIVE"
    }
  });

  const ledgerAccount = await prisma.ledgerAccount.create({
    data: {
      accountId: account.id,
      category: "CUSTOMER",
      currency: "USD",
      normalBalanceDirection: "CREDIT"
    }
  });

  await prisma.balanceProjection.create({
    data: {
      accountId: account.id,
      currency: "USD",
      currentMinor: 500_000n
    }
  });

  return {
    customerId: customer.id,
    accountId: ledgerAccount.accountId!
  };
}
