import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

import { AppModule } from "@/app.module";
import { AppConfigService } from "@/common/config/app-config.service";
import { HttpExceptionFilter } from "@/common/errors/http-exception.filter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const config = app.get(AppConfigService);

  await app.register(cors, { origin: true });
  await app.register(helmet);
  await app.register(rateLimit, {
    max: config.rateLimitMax,
    timeWindow: config.rateLimitWindowMs
  });

  app.setGlobalPrefix("api/v1");
  app.useGlobalFilters(new HttpExceptionFilter());

  app.getHttpAdapter().getInstance().addHook("onRequest", async (request, reply) => {
    const incomingCorrelationId = request.headers["x-correlation-id"];
    const correlationId =
      typeof incomingCorrelationId === "string" && incomingCorrelationId.length > 0
        ? incomingCorrelationId
        : crypto.randomUUID();

    reply.header("X-Correlation-Id", correlationId);
    (request as { context?: Record<string, string | undefined> }).context = {
      correlationId,
      idempotencyKey:
        typeof request.headers["idempotency-key"] === "string" ? request.headers["idempotency-key"] : undefined
    };
  });

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle("Ledger Credit System")
      .setDescription("Finance backend with append-only ledger, idempotent transfers, and automated credit scoring.")
      .setVersion("1.0.0")
      .addBearerAuth()
      .build()
  );
  SwaggerModule.setup("docs", app, document);

  await app.listen(config.port, "0.0.0.0");
}

void bootstrap();
