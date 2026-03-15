import type { RequestContext } from "@/common/http/request-context";
import { AppException } from "@/common/errors/app-exception";

export function assertCustomerOwnsResource(context: RequestContext, ownerCustomerId: string): void {
  if (context.actor?.actorType === "CUSTOMER" && context.actor.actorId !== ownerCustomerId) {
    throw new AppException(403, "forbidden", "Customers may only access their own resources.");
  }
}

export function assertAuthenticated(context: RequestContext): void {
  if (!context.actor) {
    throw new AppException(401, "unauthenticated", "Authentication is required.");
  }
}
