import type { FastifyRequest } from "fastify";

import type { ActorType } from "@/common/domain/types";

export interface RequestActor {
  actorId: string;
  actorType: ActorType;
  roles: string[];
}

export interface RequestContext {
  correlationId: string;
  idempotencyKey?: string;
  actor?: RequestActor;
}

export interface ContextualRequest extends FastifyRequest {
  context: RequestContext;
}

export function getRequestContext(request: FastifyRequest): RequestContext {
  const contextualRequest = request as ContextualRequest;
  const correlationHeader = request.headers["x-correlation-id"];
  const idempotencyHeader = request.headers["idempotency-key"];
  const correlationId =
    contextualRequest.context?.correlationId ??
    (typeof correlationHeader === "string" && correlationHeader.length > 0
      ? correlationHeader
      : crypto.randomUUID());

  const idempotencyKey =
    typeof idempotencyHeader === "string" && idempotencyHeader.length > 0 ? idempotencyHeader : undefined;

  contextualRequest.context = {
    ...contextualRequest.context,
    correlationId,
    ...(idempotencyKey ? { idempotencyKey } : {})
  };

  return contextualRequest.context;
}
