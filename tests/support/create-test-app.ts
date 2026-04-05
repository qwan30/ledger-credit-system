import "reflect-metadata";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";
import request from "supertest";
import type { PrismaClient } from "@prisma/client";

import { applyAppSetup } from "@/bootstrap";
import { PrismaService } from "@/common/prisma/prisma.service";

import { ensureDatabaseReady } from "./db";
import { ensureTestEnvironment } from "./test-env";

ensureTestEnvironment();

export interface TestApp {
  app: NestFastifyApplication;
  prisma: PrismaClient;
  request: ReturnType<typeof request>;
  close: () => Promise<void>;
}

export async function createTestApp(): Promise<TestApp> {
  await ensureDatabaseReady();

  const { AppModule } = await import("@/app.module");
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule]
  }).compile();

  const app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter(), {
    logger: false
  });

  await applyAppSetup(app);
  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  const prisma = app.get(PrismaService);

  return {
    app,
    prisma,
    request: request(app.getHttpServer()),
    close: async () => {
      await app.close();
    }
  };
}
