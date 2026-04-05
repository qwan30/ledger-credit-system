/* eslint-disable @typescript-eslint/no-require-imports */
import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import PgBoss = require("pg-boss");

import { AppConfigService } from "@/common/config/app-config.service";

type JobHandler<T> = (data: T) => Promise<void>;

@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
  private readonly boss?: PgBoss;
  private readonly ensuredQueues = new Set<string>();
  private readonly handlers = new Map<string, JobHandler<unknown>>();
  private readonly inlineMode: boolean;

  constructor(@Inject(AppConfigService) config: AppConfigService) {
    this.inlineMode = config.nodeEnv === "test";

    if (!this.inlineMode) {
      this.boss = new PgBoss({
        connectionString: config.databaseUrl
      });
    }
  }

  async onModuleInit(): Promise<void> {
    if (!this.inlineMode && this.boss) {
      await this.boss.start();
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.inlineMode && this.boss) {
      await this.boss.stop();
    }
  }

  async publish<T extends object>(name: string, data: T): Promise<string | null> {
    if (this.inlineMode) {
      const handler = this.handlers.get(name);

      if (handler) {
        await handler(data);
      }

      return null;
    }

    await this.ensureQueue(name);
    return this.boss!.send(name, data);
  }

  async registerHandler<T>(name: string, handler: JobHandler<T>): Promise<void> {
    if (this.inlineMode) {
      this.handlers.set(name, handler as JobHandler<unknown>);
      return;
    }

    await this.ensureQueue(name);
    await this.boss!.work<T>(name, async (jobs) => {
      for (const job of jobs) {
        await handler(job.data);
      }
    });
  }

  async schedule(name: string, cron: string, data?: object): Promise<void> {
    if (this.inlineMode) {
      return;
    }

    await this.ensureQueue(name);
    await this.boss!.schedule(name, cron, data);
  }

  private async ensureQueue(name: string): Promise<void> {
    if (this.ensuredQueues.has(name)) {
      return;
    }

    try {
      await this.boss!.createQueue(name);
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";

      if (!message.includes("already exists")) {
        throw error;
      }
    }

    this.ensuredQueues.add(name);
  }
}
