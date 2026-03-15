import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customer.upsert({
    where: { externalRef: "demo-customer-1" },
    update: {},
    create: {
      externalRef: "demo-customer-1",
      status: "ACTIVE"
    }
  });

  const [checkingAccount, savingsAccount] = await Promise.all([
    prisma.account.upsert({
      where: { id: "0d76f071-8dbf-4d01-aec5-11d448bcb5b1" },
      update: {},
      create: {
        id: "0d76f071-8dbf-4d01-aec5-11d448bcb5b1",
        customerId: customer.id,
        type: "CHECKING",
        currency: "USD",
        status: "ACTIVE"
      }
    }),
    prisma.account.upsert({
      where: { id: "498640a4-7f59-4f48-8def-e86791ce9192" },
      update: {},
      create: {
        id: "498640a4-7f59-4f48-8def-e86791ce9192",
        customerId: customer.id,
        type: "SAVINGS",
        currency: "USD",
        status: "ACTIVE"
      }
    })
  ]);

  await Promise.all([
    prisma.ledgerAccount.upsert({
      where: { accountId: checkingAccount.id },
      update: {},
      create: {
        accountId: checkingAccount.id,
        category: "CUSTOMER",
        currency: "USD",
        normalBalanceDirection: "CREDIT"
      }
    }),
    prisma.ledgerAccount.upsert({
      where: { accountId: savingsAccount.id },
      update: {},
      create: {
        accountId: savingsAccount.id,
        category: "CUSTOMER",
        currency: "USD",
        normalBalanceDirection: "CREDIT"
      }
    }),
    prisma.ledgerAccount.upsert({
      where: { id: "d1ca53fd-75eb-4b8a-9e6d-a4054631d90d" },
      update: {},
      create: {
        id: "d1ca53fd-75eb-4b8a-9e6d-a4054631d90d",
        category: "CASH",
        currency: "USD",
        normalBalanceDirection: "DEBIT"
      }
    }),
    prisma.ledgerAccount.upsert({
      where: { id: "a112f304-e9b0-4f81-a0d2-b90eac97d73d" },
      update: {},
      create: {
        id: "a112f304-e9b0-4f81-a0d2-b90eac97d73d",
        category: "CLEARING",
        currency: "USD",
        normalBalanceDirection: "DEBIT"
      }
    }),
    prisma.ledgerAccount.upsert({
      where: { id: "ae6d42ea-2b34-4db6-b7c1-681435e3b197" },
      update: {},
      create: {
        id: "ae6d42ea-2b34-4db6-b7c1-681435e3b197",
        category: "INTEREST_REVENUE",
        currency: "USD",
        normalBalanceDirection: "CREDIT"
      }
    }),
    prisma.balanceProjection.upsert({
      where: { accountId: checkingAccount.id },
      update: {},
      create: {
        accountId: checkingAccount.id,
        currency: "USD",
        currentMinor: 250_000n
      }
    }),
    prisma.balanceProjection.upsert({
      where: { accountId: savingsAccount.id },
      update: {},
      create: {
        accountId: savingsAccount.id,
        currency: "USD",
        currentMinor: 1_250_000n
      }
    })
  ]);
}

main()
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
