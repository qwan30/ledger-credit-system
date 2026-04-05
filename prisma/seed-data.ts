import type { Prisma, PrismaClient } from "@prisma/client";

import { hashSecret } from "../src/common/auth/password-hasher";

type SeedDb = PrismaClient | Prisma.TransactionClient;

export const demoData = {
  customerExternalRef: "demo-customer-1",
  customerLoginId: "demo-customer-1",
  customerSecret: "demo-secret-123",
  checkingAccountId: "0d76f071-8dbf-4d01-aec5-11d448bcb5b1",
  savingsAccountId: "498640a4-7f59-4f48-8def-e86791ce9192",
  cashLedgerAccountId: "d1ca53fd-75eb-4b8a-9e6d-a4054631d90d",
  clearingLedgerAccountId: "a112f304-e9b0-4f81-a0d2-b90eac97d73d",
  interestRevenueLedgerAccountId: "ae6d42ea-2b34-4db6-b7c1-681435e3b197"
} as const;

export interface SeedResult {
  customerId: string;
  checkingAccountId: string;
  savingsAccountId: string;
}

export async function seedBaseData(prisma: SeedDb): Promise<SeedResult> {
  const existingCustomer = await prisma.customer.findUnique({
    where: {
      externalRef: demoData.customerExternalRef
    }
  });

  const customer = existingCustomer
    ? await prisma.customer.update({
        where: { id: existingCustomer.id },
        data: {
          status: "ACTIVE"
        }
      })
    : await prisma.customer.create({
        data: {
          externalRef: demoData.customerExternalRef,
          status: "ACTIVE"
        }
      });

  const checkingAccount = await prisma.account.upsert({
    where: { id: demoData.checkingAccountId },
    update: {
      customerId: customer.id,
      status: "ACTIVE"
    },
    create: {
      id: demoData.checkingAccountId,
      customerId: customer.id,
      type: "CHECKING",
      currency: "USD",
      status: "ACTIVE"
    }
  });

  const savingsAccount = await prisma.account.upsert({
    where: { id: demoData.savingsAccountId },
    update: {
      customerId: customer.id,
      status: "ACTIVE"
    },
    create: {
      id: demoData.savingsAccountId,
      customerId: customer.id,
      type: "SAVINGS",
      currency: "USD",
      status: "ACTIVE"
    }
  });

  await prisma.ledgerAccount.upsert({
    where: { accountId: checkingAccount.id },
    update: {},
    create: {
      accountId: checkingAccount.id,
      category: "CUSTOMER",
      currency: "USD",
      normalBalanceDirection: "CREDIT"
    }
  });

  await prisma.ledgerAccount.upsert({
    where: { accountId: savingsAccount.id },
    update: {},
    create: {
      accountId: savingsAccount.id,
      category: "CUSTOMER",
      currency: "USD",
      normalBalanceDirection: "CREDIT"
    }
  });

  await prisma.ledgerAccount.upsert({
    where: { id: demoData.cashLedgerAccountId },
    update: {},
    create: {
      id: demoData.cashLedgerAccountId,
      category: "CASH",
      currency: "USD",
      normalBalanceDirection: "DEBIT"
    }
  });

  await prisma.ledgerAccount.upsert({
    where: { id: demoData.clearingLedgerAccountId },
    update: {},
    create: {
      id: demoData.clearingLedgerAccountId,
      category: "CLEARING",
      currency: "USD",
      normalBalanceDirection: "DEBIT"
    }
  });

  await prisma.ledgerAccount.upsert({
    where: { id: demoData.interestRevenueLedgerAccountId },
    update: {},
    create: {
      id: demoData.interestRevenueLedgerAccountId,
      category: "INTEREST_REVENUE",
      currency: "USD",
      normalBalanceDirection: "CREDIT"
    }
  });

  await prisma.balanceProjection.upsert({
    where: { accountId: checkingAccount.id },
    update: {
      currentMinor: 250_000n
    },
    create: {
      accountId: checkingAccount.id,
      currency: "USD",
      currentMinor: 250_000n
    }
  });

  await prisma.balanceProjection.upsert({
    where: { accountId: savingsAccount.id },
    update: {
      currentMinor: 1_250_000n
    },
    create: {
      accountId: savingsAccount.id,
      currency: "USD",
      currentMinor: 1_250_000n
    }
  });

  const customerPrincipal = await prisma.authPrincipal.upsert({
    where: {
      customerId: customer.id
    },
    update: {
      loginId: demoData.customerLoginId,
      actorType: "CUSTOMER",
      actorId: customer.id,
      status: "ACTIVE"
    },
    create: {
      loginId: demoData.customerLoginId,
      actorType: "CUSTOMER",
      actorId: customer.id,
      customerId: customer.id,
      status: "ACTIVE"
    }
  });

  const existingCredential = await prisma.authCredential.findFirst({
    where: {
      principalId: customerPrincipal.id,
      type: "PASSWORD"
    }
  });

  if (!existingCredential) {
    await prisma.authCredential.create({
      data: {
        principalId: customerPrincipal.id,
        type: "PASSWORD",
        secretHash: hashSecret(demoData.customerSecret)
      }
    });
  }

  await prisma.roleBinding.upsert({
    where: {
      principalId_role: {
        principalId: customerPrincipal.id,
        role: "CUSTOMER"
      }
    },
    update: {},
    create: {
      principalId: customerPrincipal.id,
      role: "CUSTOMER"
    }
  });

  return {
    customerId: customer.id,
    checkingAccountId: checkingAccount.id,
    savingsAccountId: savingsAccount.id
  };
}
