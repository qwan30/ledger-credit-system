export type ExternalRailEventType = "ACKNOWLEDGED" | "SETTLED" | "FAILED";

export interface ExternalRailTransfer {
  transferRequestId: string;
  externalReference: string;
  destinationExternalAccountNumber: string | null;
}

export interface NormalizedExternalRailEvent {
  provider: string;
  providerEventId: string;
  transferRequestId?: string;
  externalReference?: string;
  eventType: ExternalRailEventType;
  payload: Record<string, unknown>;
  failureReason?: string;
}

export interface ExternalRailAdapter {
  readonly provider: string;
  submitTransfer(transfer: ExternalRailTransfer): Promise<NormalizedExternalRailEvent[]>;
  normalizeInboundEvent(payload: unknown): Promise<NormalizedExternalRailEvent>;
  reconcileTransfer(transfer: ExternalRailTransfer): Promise<NormalizedExternalRailEvent | null>;
}
