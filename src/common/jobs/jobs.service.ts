/* eslint-disable @typescript-eslint/no-require-imports */
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import PgBoss = require("pg-boss");

import { AppConfigService } from "@/common/config/app-config.service";

type JobHandler<T> = (data: T) => Promise<void>;

@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
  private readonly boss: PgBoss;

  constructor(config: AppConfigService) {
    this.boss = new PgBoss({
      connectionString: config.databaseUrl
    });
  }

  async onModuleInit(): Promise<void> {
    await this.boss.start();
  }

  async onModuleDestroy(): Promise<void> {
    await this.boss.stop();
  }

  async publish<T extends object>(name: string, data: T): Promise<string | null> {
    await this.boss.createQueue(name);
    return this.boss.send(name, data);
  }

  async registerHandler<T>(name: string, handler: JobHandler<T>): Promise<void> {
    await this.boss.createQueue(name);
    await this.boss.work<T>(name, async (jobs) => {
      for (const job of jobs) {
        await handler(job.data);
      }
    });
  }

  async schedule(name: string, cron: string, data?: object): Promise<void> {
    await this.boss.createQueue(name);
    await this.boss.schedule(name, cron, data);
  }
}
