import { Inject, Injectable } from "@nestjs/common";
import { z } from "zod";

import { AppConfigService } from "@/common/config/app-config.service";
import type {
  ExternalRailAdapter,
  ExternalRailTransfer,
  NormalizedExternalRailEvent
} from "@/modules/transfers/external-rail.adapter";

@Injectable()
export class ExternalRailSimulatorService implements ExternalRailAdapter {
  readonly provider = "simulator";

  constructor(@Inject(AppConfigService) private readonly config: AppConfigService) {}

  async submitTransfer(transfer: ExternalRailTransfer): Promise<NormalizedExternalRailEvent[]> {
    const acknowledgedEvent: NormalizedExternalRailEvent = {
      provider: this.provider,
      providerEventId: `${transfer.transferRequestId}:acknowledged`,
      transferRequestId: transfer.transferRequestId,
      externalReference: transfer.externalReference,
      eventType: "ACKNOWLEDGED",
      payload: {
        externalReference: transfer.externalReference
      }
    };

    await new Promise((resolve) => setTimeout(resolve, this.config.externalSimulatorSettlementDelayMs));

    return [acknowledgedEvent, this.buildTerminalEvent(transfer, "submit")];
  }

  normalizeInboundEvent(payload: unknown): Promise<NormalizedExternalRailEvent> {
    const event = z
      .object({
        providerEventId: z.string().trim().min(1).max(255),
        transferRequestId: z.string().uuid().optional(),
        externalReference: z.string().trim().min(1).max(255).optional(),
        status: z.enum(["ACKNOWLEDGED", "SETTLED", "FAILED"]),
        failureReason: z.string().trim().min(1).max(255).optional()
      })
      .superRefine((value, ctx) => {
        if (!value.transferRequestId && !value.externalReference) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["transferRequestId"],
            message: "transferRequestId or externalReference is required."
          });
        }
      })
      .parse(payload);

    return Promise.resolve({
      provider: this.provider,
      providerEventId: event.providerEventId,
      eventType: event.status,
      payload: {
        status: event.status
      },
      ...(event.transferRequestId ? { transferRequestId: event.transferRequestId } : {}),
      ...(event.externalReference ? { externalReference: event.externalReference } : {}),
      ...(event.failureReason ? { failureReason: event.failureReason } : {})
    });
  }

  reconcileTransfer(transfer: ExternalRailTransfer): Promise<NormalizedExternalRailEvent | null> {
    return Promise.resolve(this.buildTerminalEvent(transfer, "reconcile"));
  }

  private buildTerminalEvent(transfer: ExternalRailTransfer, reason: "submit" | "reconcile"): NormalizedExternalRailEvent {
    const shouldFail = transfer.destinationExternalAccountNumber?.endsWith("99") ?? false;

    if (shouldFail) {
      return {
        provider: this.provider,
        providerEventId: `${transfer.transferRequestId}:${reason}:failed`,
        transferRequestId: transfer.transferRequestId,
        externalReference: transfer.externalReference,
        eventType: "FAILED",
        payload: {
          reason: "Simulator rejected the transfer."
        },
        failureReason: "Simulator rejected the transfer."
      };
    }

    return {
      provider: this.provider,
      providerEventId: `${transfer.transferRequestId}:${reason}:settled`,
      transferRequestId: transfer.transferRequestId,
      externalReference: transfer.externalReference,
      eventType: "SETTLED",
      payload: {
        settled: true
      }
    };
  }
}
