import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { AppConfigService } from "@/common/config/app-config.service";
import { AppException } from "@/common/errors/app-exception";
import type { RequestContext } from "@/common/http/request-context";
import { JobsService } from "@/common/jobs/jobs.service";
import { Money } from "@/common/money/money";
import { PrismaService } from "@/common/prisma/prisma.service";
import { AuditService } from "@/modules/audit/audit.service";
import type { ExternalRailTransfer, NormalizedExternalRailEvent } from "@/modules/transfers/external-rail.adapter";
import { ExternalRailRegistry } from "@/modules/transfers/external-rail.registry";
import { LedgerService } from "@/modules/ledger/ledger.service";

@Injectable()
export class ExternalRailService implements OnModuleInit {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(LedgerService) private readonly ledgerService: LedgerService,
    @Inject(AuditService) private readonly auditService: AuditService,
    @Inject(JobsService) private readonly jobsService: JobsService,
    @Inject(ExternalRailRegistry) private readonly externalRailRegistry: ExternalRailRegistry,
    @Inject(AppConfigService) private readonly config: AppConfigService
  ) {}

  async onModuleInit(): Promise<void> {
    await this.jobsService.registerHandler<{ transferRequestId: string }>("external-transfer.submit", async (payload) => {
      await this.processQueuedSubmission(payload.transferRequestId);
    });
  }

  assertCallbackSecret(secret: string | string[] | undefined): void {
    if (typeof secret !== "string" || secret !== this.config.externalRailCallbackSecret) {
      throw new AppException(401, "invalid_external_rail_secret", "External rail callback secret is invalid.");
    }
  }

  async enqueueTransferSubmission(transferRequestId: string): Promise<void> {
    await this.jobsService.publish("external-transfer.submit", {
      transferRequestId
    });
  }

  async ingestProviderEvent(provider: string, payload: unknown) {
    const adapter = this.externalRailRegistry.get(provider);
    const normalizedEvent = await adapter.normalizeInboundEvent(payload);
    return this.applyNormalizedEvent(normalizedEvent);
  }

  async getExternalEvents(transferRequestId: string) {
    const events = await this.prisma.externalTransferEvent.findMany({
      where: {
        transferRequestId
      },
      orderBy: [
        {
          createdAt: "asc"
        }
      ]
    });

    return events.map((event) => ({
      provider: event.provider,
      providerEventId: event.providerEventId,
      eventType: event.eventType,
      payload: event.payload,
      processedAt: event.processedAt?.toISOString(),
      createdAt: event.createdAt.toISOString()
    }));
  }

  async reconcileTransfer(transferRequestId: string, context: RequestContext) {
    const transfer = await this.loadTransferOrThrow(transferRequestId);
    const adapter = this.externalRailRegistry.get(transfer.externalRailProvider);
    const normalizedEvent = await adapter.reconcileTransfer(this.mapTransferForAdapter(transfer));

    if (normalizedEvent) {
      await this.applyNormalizedEvent(normalizedEvent);
    }

    await this.auditService.record(context, {
      actionType: "transfer.reconciled",
      resourceType: "transfer_request",
      resourceId: transferRequestId,
      metadata: {
        provider: transfer.externalRailProvider
      }
    });

    const updated = await this.loadTransferOrThrow(transferRequestId);
    return this.mapTransferResponse(updated);
  }

  async redriveTransfer(transferRequestId: string, context: RequestContext) {
    const transfer = await this.loadTransferOrThrow(transferRequestId);

    if (transfer.status !== "PENDING_EXTERNAL") {
      throw new AppException(
        409,
        "transfer_not_redriveable",
        "Only transfers pending an external rail outcome may be re-driven."
      );
    }

    await this.enqueueTransferSubmission(transferRequestId);
    await this.auditService.record(context, {
      actionType: "transfer.redriven",
      resourceType: "transfer_request",
      resourceId: transferRequestId,
      metadata: {
        provider: transfer.externalRailProvider
      }
    });

    return {
      transferRequestId,
      accepted: true
    };
  }

  private async processQueuedSubmission(transferRequestId: string): Promise<void> {
    const transfer = await this.loadTransferOrThrow(transferRequestId);

    if (transfer.status !== "PENDING_EXTERNAL") {
      return;
    }

    const adapter = this.externalRailRegistry.get(transfer.externalRailProvider);
    const events = await adapter.submitTransfer(this.mapTransferForAdapter(transfer));

    for (const event of events) {
      await this.applyNormalizedEvent(event);
    }
  }

  private async applyNormalizedEvent(event: NormalizedExternalRailEvent) {
    const transfer = await this.prisma.$transaction(async (tx) => {
      const existingEvent = await tx.externalTransferEvent.findUnique({
        where: {
          provider_providerEventId: {
            provider: event.provider,
            providerEventId: event.providerEventId
          }
        }
      });

      const transferRecord = await tx.transferRequest.findFirst({
        where: {
          OR: [
            ...(event.transferRequestId ? [{ id: event.transferRequestId }] : []),
            ...(event.externalReference ? [{ externalReference: event.externalReference }] : [])
          ]
        },
        include: {
          sourceAccount: {
            include: {
              ledgerAccount: true
            }
          }
        }
      });

      if (!transferRecord) {
        throw new AppException(404, "transfer_not_found", "Transfer request was not found.");
      }

      if (existingEvent) {
        return transferRecord;
      }

      await tx.externalTransferEvent.create({
        data: {
          transferRequestId: transferRecord.id,
          provider: event.provider,
          providerEventId: event.providerEventId,
          eventType: event.eventType,
          payload: event.payload as Prisma.InputJsonValue,
          processedAt: new Date()
        }
      });

      if (event.eventType === "ACKNOWLEDGED") {
        return transferRecord;
      }

      if (event.eventType === "SETTLED") {
        if (transferRecord.status === "PENDING_EXTERNAL") {
          await tx.transferRequest.update({
            where: {
              id: transferRecord.id
            },
            data: {
              status: "SETTLED",
              settledAt: new Date()
            }
          });

          return {
            ...transferRecord,
            status: "SETTLED",
            settledAt: new Date()
          };
        }

        return transferRecord;
      }

      if (transferRecord.status === "PENDING_EXTERNAL" && transferRecord.sourceAccount.ledgerAccount) {
        const clearingLedgerAccount = await this.ledgerService.findSystemLedgerAccount(
          tx,
          "CLEARING",
          transferRecord.currency
        );
        const amount = Money.fromMinorUnits(transferRecord.currency, transferRecord.amountMinor);

        await tx.transferRequest.update({
          where: {
            id: transferRecord.id
          },
          data: {
            status: "FAILED",
            failureReason: event.failureReason ?? "External rail rejected the transfer."
          }
        });

        await this.ledgerService.postJournalEntry(tx, {
          transferRequestId: transferRecord.id,
          effectiveAt: new Date(),
          sourceOperationType: "INTERBANK_TRANSFER_COMPENSATION",
          description: "Automatic compensation for failed external transfer",
          correlationId: transferRecord.correlationId ?? undefined,
          idempotencyKey: transferRecord.idempotencyKey,
          postings: [
            {
              ledgerAccountId: clearingLedgerAccount.id,
              direction: "DEBIT",
              amount
            },
            {
              ledgerAccountId: transferRecord.sourceAccount.ledgerAccount.id,
              direction: "CREDIT",
              amount
            }
          ]
        });

        await tx.transferRequest.update({
          where: {
            id: transferRecord.id
          },
          data: {
            status: "COMPENSATED"
          }
        });

        await tx.externalTransferEvent.create({
          data: {
            transferRequestId: transferRecord.id,
            provider: event.provider,
            providerEventId: `${event.providerEventId}:compensated`,
            eventType: "COMPENSATED",
            payload: {
              compensated: true,
              sourceProviderEventId: event.providerEventId
            } as Prisma.InputJsonValue,
            processedAt: new Date()
          }
        });

        return {
          ...transferRecord,
          status: "COMPENSATED",
          failureReason: event.failureReason ?? "External rail rejected the transfer."
        };
      }

      return transferRecord;
    });

    await this.auditService.record(
      {
        correlationId: transfer.correlationId ?? crypto.randomUUID(),
        idempotencyKey: transfer.idempotencyKey,
        actor: {
          actorId: `external-rail:${event.provider}`,
          actorType: "SYSTEM",
          roles: []
        }
      },
      {
        actionType: this.mapAuditAction(event.eventType, transfer.status),
        resourceType: "transfer_request",
        resourceId: transfer.id,
        metadata: {
          provider: event.provider
        }
      }
    );

    return this.mapTransferResponse(transfer);
  }

  private mapAuditAction(eventType: NormalizedExternalRailEvent["eventType"], transferStatus: string) {
    if (eventType === "ACKNOWLEDGED") {
      return "transfer.external_acknowledged";
    }

    if (eventType === "SETTLED") {
      return "transfer.settled";
    }

    return transferStatus === "COMPENSATED" ? "transfer.compensated" : "transfer.failed";
  }

  private async loadTransferOrThrow(transferRequestId: string) {
    const transfer = await this.prisma.transferRequest.findUnique({
      where: {
        id: transferRequestId
      },
      include: {
        sourceAccount: {
          include: {
            ledgerAccount: true
          }
        }
      }
    });

    if (!transfer) {
      throw new AppException(404, "transfer_not_found", "Transfer request was not found.");
    }

    return {
      ...transfer,
      externalRailProvider: transfer.externalRailProvider ?? this.config.externalRailDefaultProvider
    };
  }

  private mapTransferForAdapter(transfer: {
    id: string;
    externalReference: string | null;
    destinationExternalAccountNumber: string | null;
  }): ExternalRailTransfer {
    if (!transfer.externalReference) {
      throw new AppException(500, "external_reference_missing", "External transfer is missing an external reference.");
    }

    return {
      transferRequestId: transfer.id,
      externalReference: transfer.externalReference,
      destinationExternalAccountNumber: transfer.destinationExternalAccountNumber
    };
  }

  private mapTransferResponse(transfer: {
    id: string;
    status: string;
    amountMinor: bigint;
    currency: string;
    sourceAccountId: string;
    destinationAccountId: string | null;
    destinationExternalBankCode: string | null;
    destinationExternalAccountNumber: string | null;
    destinationExternalAccountName: string | null;
    externalReference: string | null;
    externalRailProvider: string | null;
    failureReason: string | null;
    createdAt: Date;
    settledAt?: Date | null;
  }) {
    return {
      transferRequestId: transfer.id,
      status: transfer.status,
      amount: {
        currency: transfer.currency,
        minorUnits: Number(transfer.amountMinor)
      },
      sourceAccountId: transfer.sourceAccountId,
      destination:
        transfer.destinationAccountId
          ? {
              type: "INTERNAL_ACCOUNT",
              accountId: transfer.destinationAccountId
            }
          : {
              type: "EXTERNAL_BANK",
              bankCode: transfer.destinationExternalBankCode,
              accountNumber: transfer.destinationExternalAccountNumber,
              accountName: transfer.destinationExternalAccountName
            },
      externalRailProvider: transfer.externalRailProvider,
      externalReference: transfer.externalReference,
      failureReason: transfer.failureReason,
      createdAt: transfer.createdAt.toISOString(),
      settledAt: transfer.settledAt?.toISOString()
    };
  }
}
