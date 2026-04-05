import { Injectable } from "@nestjs/common";
import { z } from "zod";

import type {
  ExternalRailAdapter,
  ExternalRailTransfer,
  NormalizedExternalRailEvent
} from "@/modules/transfers/external-rail.adapter";

@Injectable()
export class ExternalRailMockBankService implements ExternalRailAdapter {
  readonly provider = "mock-bank";

  submitTransfer(transfer: ExternalRailTransfer): Promise<NormalizedExternalRailEvent[]> {
    return Promise.resolve([
      {
        provider: this.provider,
        providerEventId: `${transfer.transferRequestId}:mock-bank:accepted`,
        transferRequestId: transfer.transferRequestId,
        externalReference: transfer.externalReference,
        eventType: "ACKNOWLEDGED",
        payload: {
          lifecycle: "accepted"
        }
      },
      this.buildTerminalEvent(transfer, "submit")
    ]);
  }

  normalizeInboundEvent(payload: unknown): Promise<NormalizedExternalRailEvent> {
    const event = z
      .object({
        eventId: z.string().trim().min(1).max(255),
        transfer: z
          .object({
            requestId: z.string().uuid().optional(),
            reference: z.string().trim().min(1).max(255).optional()
          })
          .superRefine((value, ctx) => {
            if (!value.requestId && !value.reference) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["requestId"],
                message: "requestId or reference is required."
              });
            }
          }),
        outcome: z.object({
          state: z.enum(["accepted", "settled", "rejected"]),
          reason: z.string().trim().min(1).max(255).optional()
        })
      })
      .parse(payload);

    return Promise.resolve({
      provider: this.provider,
      providerEventId: event.eventId,
      eventType: this.mapState(event.outcome.state),
      payload: {
        state: event.outcome.state
      },
      ...(event.transfer.requestId ? { transferRequestId: event.transfer.requestId } : {}),
      ...(event.transfer.reference ? { externalReference: event.transfer.reference } : {}),
      ...(event.outcome.reason ? { failureReason: event.outcome.reason } : {})
    });
  }

  reconcileTransfer(transfer: ExternalRailTransfer): Promise<NormalizedExternalRailEvent | null> {
    return Promise.resolve(this.buildTerminalEvent(transfer, "reconcile"));
  }

  private buildTerminalEvent(
    transfer: ExternalRailTransfer,
    reason: "submit" | "reconcile"
  ): NormalizedExternalRailEvent {
    const shouldFail = transfer.destinationExternalAccountNumber?.endsWith("88") ?? false;

    if (shouldFail) {
      return {
        provider: this.provider,
        providerEventId: `${transfer.transferRequestId}:mock-bank:${reason}:failed`,
        transferRequestId: transfer.transferRequestId,
        externalReference: transfer.externalReference,
        eventType: "FAILED",
        payload: {
          state: "rejected"
        },
        failureReason: "Mock bank rejected the transfer."
      };
    }

    return {
      provider: this.provider,
      providerEventId: `${transfer.transferRequestId}:mock-bank:${reason}:settled`,
      transferRequestId: transfer.transferRequestId,
      externalReference: transfer.externalReference,
      eventType: "SETTLED",
      payload: {
        state: "settled"
      }
    };
  }

  private mapState(state: "accepted" | "settled" | "rejected"): NormalizedExternalRailEvent["eventType"] {
    if (state === "accepted") {
      return "ACKNOWLEDGED";
    }

    if (state === "settled") {
      return "SETTLED";
    }

    return "FAILED";
  }
}
