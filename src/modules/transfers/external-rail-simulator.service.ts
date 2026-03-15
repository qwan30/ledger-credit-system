import { Injectable, OnModuleInit } from "@nestjs/common";

import { AppConfigService } from "@/common/config/app-config.service";
import { JobsService } from "@/common/jobs/jobs.service";
import { Money } from "@/common/money/money";
import { PrismaService } from "@/common/prisma/prisma.service";
import { AuditService } from "@/modules/audit/audit.service";
import { LedgerService } from "@/modules/ledger/ledger.service";

interface ExternalTransferJobPayload {
  transferRequestId: string;
}

@Injectable()
export class ExternalRailSimulatorService implements OnModuleInit {
  constructor(
    private readonly jobsService: JobsService,
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly ledgerService: LedgerService,
    private readonly auditService: AuditService
  ) {}

  async onModuleInit(): Promise<void> {
    await this.jobsService.registerHandler<ExternalTransferJobPayload>("external-transfer.submit", async (payload) => {
      await this.process(payload.transferRequestId);
    });
  }

  private async process(transferRequestId: string): Promise<void> {
    const transfer = await this.prisma.transferRequest.findUnique({
      where: { id: transferRequestId },
      include: {
        sourceAccount: {
          include: {
            ledgerAccount: true
          }
        }
      }
    });

    if (!transfer || transfer.status !== "PENDING_EXTERNAL" || !transfer.sourceAccount.ledgerAccount) {
      return;
    }

    await this.prisma.externalTransferEvent.create({
      data: {
        transferRequestId,
        eventType: "ACKNOWLEDGED",
        payload: {
          externalReference: transfer.externalReference
        },
        processedAt: new Date()
      }
    });

    await new Promise((resolve) => setTimeout(resolve, this.config.externalSimulatorSettlementDelayMs));

    const shouldFail = transfer.destinationExternalAccountNumber?.endsWith("99") ?? false;

    if (shouldFail) {
      await this.prisma.$transaction(async (tx) => {
        const current = await tx.transferRequest.findUnique({
          where: { id: transferRequestId }
        });

        if (!current || current.status !== "PENDING_EXTERNAL") {
          return;
        }

        const clearingLedgerAccount = await this.ledgerService.findSystemLedgerAccount(tx, "CLEARING", current.currency);
        const amount = Money.fromMinorUnits(current.currency, current.amountMinor);

        await tx.transferRequest.update({
          where: { id: current.id },
          data: {
            status: "FAILED",
            failureReason: "Simulator rejected the transfer."
          }
        });

        await tx.externalTransferEvent.create({
          data: {
            transferRequestId,
            eventType: "FAILED",
            payload: {
              reason: "Simulator rejected the transfer."
            },
            processedAt: new Date()
          }
        });

        await this.ledgerService.postJournalEntry(tx, {
          transferRequestId: current.id,
          effectiveAt: new Date(),
          sourceOperationType: "INTERBANK_TRANSFER_COMPENSATION",
          description: "Automatic compensation for failed simulated transfer",
          correlationId: current.correlationId ?? undefined,
          idempotencyKey: current.idempotencyKey,
          postings: [
            {
              ledgerAccountId: clearingLedgerAccount.id,
              direction: "DEBIT",
              amount
            },
            {
              ledgerAccountId: transfer.sourceAccount.ledgerAccount!.id,
              direction: "CREDIT",
              amount
            }
          ]
        });

        await tx.transferRequest.update({
          where: { id: current.id },
          data: {
            status: "COMPENSATED"
          }
        });

        await tx.externalTransferEvent.create({
          data: {
            transferRequestId,
            eventType: "COMPENSATED",
            payload: {
              compensated: true
            },
            processedAt: new Date()
          }
        });
      });

      await this.auditService.record(
        {
          correlationId: transfer.correlationId ?? crypto.randomUUID(),
          actor: {
            actorId: "external-rail-simulator",
            actorType: "SYSTEM",
            roles: []
          },
          idempotencyKey: transfer.idempotencyKey
        },
        {
          actionType: "transfer.compensated",
          resourceType: "transfer_request",
          resourceId: transfer.id,
          metadata: {
            reason: "Simulator rejected the transfer."
          }
        }
      );

      return;
    }

    await this.prisma.$transaction(async (tx) => {
      const current = await tx.transferRequest.findUnique({
        where: { id: transferRequestId }
      });

      if (!current || current.status !== "PENDING_EXTERNAL") {
        return;
      }

      await tx.externalTransferEvent.create({
        data: {
          transferRequestId,
          eventType: "SETTLED",
          payload: {
            settled: true
          },
          processedAt: new Date()
        }
      });

      await tx.transferRequest.update({
        where: { id: current.id },
        data: {
          status: "SETTLED",
          settledAt: new Date()
        }
      });
    });

    await this.auditService.record(
      {
        correlationId: transfer.correlationId ?? crypto.randomUUID(),
        actor: {
          actorId: "external-rail-simulator",
          actorType: "SYSTEM",
          roles: []
        },
        idempotencyKey: transfer.idempotencyKey
      },
      {
        actionType: "transfer.settled",
        resourceType: "transfer_request",
        resourceId: transfer.id
      }
    );
  }
}
