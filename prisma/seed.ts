import { PrismaClient } from "@prisma/client";

import { seedBaseData } from "./seed-data";

const prisma = new PrismaClient();

async function main() {
  await seedBaseData(prisma);
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
