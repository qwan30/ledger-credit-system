import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { ZodError } from "zod";

import { AppException } from "@/common/errors/app-exception";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    if (exception instanceof AppException) {
      response.status(exception.statusCode).send({
        error: {
          code: exception.code,
          message: exception.message,
          details: exception.details
        }
      });
      return;
    }

    if (exception instanceof ZodError) {
      response.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
        error: {
          code: "validation_error",
          message: "Request validation failed",
          details: exception.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        }
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      error: {
        code: "internal_error",
        message: "An unexpected error occurred."
      }
    });
  }
}
