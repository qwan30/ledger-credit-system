import type { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";

import { ensurePostgres } from "../../scripts/lib/ensure-postgres";
import { ensureTestEnvironment } from "./test-env";

ensureTestEnvironment();

let databaseReadyPromise: Promise<void> | undefined;

export async function ensureDatabaseReady(): Promise<void> {
  databaseReadyPromise ??= Promise.resolve().then(() => {
    return ensurePostgres({
      cwd: process.cwd(),
      databaseUrl: process.env.DATABASE_URL,
      quiet: true
    }).then(() => {
      try {
        execSync("npx prisma migrate deploy", {
          cwd: process.cwd(),
          stdio: "inherit"
        });
      } catch (error) {
        throw new Error(
          "Unable to prepare the integration database. Ensure PostgreSQL is available at the configured DATABASE_URL or run `npm run verify:full` to bootstrap the expected local stack.",
          {
            cause: error
          }
        );
      }
    });
  });

  await databaseReadyPromise;
}

export async function truncateApplicationTables(prisma: PrismaClient): Promise<void> {
  const tables = await prisma.$queryRaw<Array<{ schemaname: string; tablename: string }>>`
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> '_prisma_migrations'
  `;

  if (tables.length === 0) {
    return;
  }

  const tableNames = tables.map(({ schemaname, tablename }) => `"${schemaname}"."${tablename}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`);
}
