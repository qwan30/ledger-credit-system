import { Inject, Injectable } from "@nestjs/common";

import { assertAuthenticated, assertCustomerOwnsResource } from "@/common/auth/authorization";
import { AppConfigService } from "@/common/config/app-config.service";
import { AppException } from "@/common/errors/app-exception";
import { hashRequestPayload } from "@/common/idempotency/hash-request";
import { IdempotencyService } from "@/common/idempotency/idempotency.service";
import type { RequestContext } from "@/common/http/request-context";
import { Money } from "@/common/money/money";
import { PrismaService } from "@/common/prisma/prisma.service";
import { AuditService } from "@/modules/audit/audit.service";
import { ExternalRailRegistry } from "@/modules/transfers/external-rail.registry";
import { ExternalRailService } from "@/modules/transfers/external-rail.service";
import { LedgerService } from "@/modules/ledger/ledger.service";
import type { CreateTransferRequest } from "@/modules/transfers/transfers.schemas";

interface TransferMutationResult {
  statusCode: number;
  body: unknown;
  enqueueTransferId?: string;
}

@Injectable()
export class TransfersService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AppConfigService) private readonly config: AppConfigService,
    @Inject(LedgerService) private readonly ledgerService: LedgerService,
    @Inject(AuditService) private readonly auditService: AuditService,
    @Inject(IdempotencyService) private readonly idempotencyService: IdempotencyService,
    @Inject(ExternalRailRegistry) private readonly externalRailRegistry: ExternalRailRegistry,
    @Inject(ExternalRailService) private readonly externalRailService: ExternalRailService
  ) {}

  async createTransfer(input: CreateTransferRequest, context: RequestContext) {
    assertAuthenticated(context);

    if (!context.idempotencyKey) {
      throw new AppException(400, "missing_idempotency_key", "Idempotency-Key header is required.");
    }

    if (!this.config.supportedCurrencies.includes(input.amount.currency)) {
      throw new AppException(422, "unsupported_currency", `Unsupported currency ${input.amount.currency}.`);
    }

    const idempotencyKey = context.idempotencyKey;
    const correlationId = context.correlationId;
    const requestHash = hashRequestPayload(input);
    const externalRailProvider =
      input.destination.type === "EXTERNAL_BANK"
        ? this.externalRailRegistry.get(input.destination.provider ?? this.config.externalRailDefaultProvider).provider
        : null;

    const transactionalResult = await this.prisma.$transaction<TransferMutationResult>(async (tx) => {
      const idempotency = await this.idempotencyService.begin(tx, "transfer.create", idempotencyKey, requestHash);

      if (idempotency.replay) {
        return {
          statusCode: idempotency.replay.statusCode,
          body: idempotency.replay.body
        };
      }

      const sourceAccount = await tx.account.findUnique({
        where: { id: input.sourceAccountId },
        include: {
          ledgerAccount: true,
          balanceProjection: true
        }
      });

      if (!sourceAccount?.ledgerAccount) {
        throw new AppException(404, "source_account_not_found", "Source account was not found.");
      }

      assertCustomerOwnsResource(context, sourceAccount.customerId);

      if (sourceAccount.status !== "ACTIVE") {
        throw new AppException(409, "source_account_inactive", "Source account is not active.");
      }

      if (sourceAccount.currency !== input.amount.currency) {
        throw new AppException(422, "currency_mismatch", "Transfer currency must match the source account currency.");
      }

      const amount = Money.fromMinorUnits(input.amount.currency, input.amount.minorUnits);
      if (amount.minorUnits <= 0n) {
        throw new AppException(422, "invalid_amount", "Transfer amount must be positive.");
      }

      const currentBalance = sourceAccount.balanceProjection?.currentMinor ?? 0n;
      if (currentBalance < amount.minorUnits) {
        throw new AppException(422, "insufficient_funds", "Source account does not have sufficient balance.");
      }

      const transferType = input.destination.type === "INTERNAL_ACCOUNT" ? "INTERNAL" : "INTERBANK";
      const transfer = await tx.transferRequest.create({
        data: {
          transferType,
          status: "RECEIVED",
          sourceAccountId: sourceAccount.id,
          amountMinor: amount.minorUnits,
          currency: amount.currency,
          idempotencyKey,
          requestHash,
          correlationId,
          ...(input.destination.type === "INTERNAL_ACCOUNT"
            ? { destinationAccountId: input.destination.accountId }
            : {
                externalRailProvider,
                destinationExternalBankCode: input.destination.bankCode,
                destinationExternalAccountNumber: input.destination.accountNumber,
                destinationExternalAccountName: input.destination.accountName
              })
        }
      });

      await tx.transferRequest.update({
        where: { id: transfer.id },
        data: {
          status: "VALIDATED"
        }
      });

      if (input.destination.type === "INTERNAL_ACCOUNT") {
        const destinationAccount = await tx.account.findUnique({
          where: { id: input.destination.accountId },
          include: { ledgerAccount: true }
        });

        if (!destinationAccount?.ledgerAccount) {
          throw new AppException(404, "destination_account_not_found", "Destination account was not found.");
        }

        if (destinationAccount.currency !== amount.currency) {
          throw new AppException(422, "currency_mismatch", "Destination account currency must match the transfer currency.");
        }

        await tx.transferRequest.update({
          where: { id: transfer.id },
          data: { status: "PENDING_LEDGER" }
        });

        await this.ledgerService.postJournalEntry(tx, {
          transferRequestId: transfer.id,
          effectiveAt: new Date(),
          sourceOperationType: "INTERNAL_TRANSFER",
          description: input.purpose,
          correlationId,
          idempotencyKey,
          postings: [
            {
              ledgerAccountId: sourceAccount.ledgerAccount.id,
              direction: "DEBIT",
              amount
            },
            {
              ledgerAccountId: destinationAccount.ledgerAccount.id,
              direction: "CREDIT",
              amount
            }
          ]
        });

        const settledTransfer = await tx.transferRequest.update({
          where: { id: transfer.id },
          data: {
            status: "SETTLED",
            settledAt: new Date()
          }
        });

        const responseBody = {
          data: {
            transferRequestId: settledTransfer.id,
            status: settledTransfer.status,
            correlationId: settledTransfer.correlationId
          }
        };

        await this.idempotencyService.complete(
          tx,
          idempotency.recordId!,
          200,
          responseBody,
          "transfer_request",
          settledTransfer.id
        );
        await this.auditService.recordInTransaction(tx, context, {
          actionType: "transfer.created",
          resourceType: "transfer_request",
          resourceId: settledTransfer.id,
          metadata: {
            transferType,
            status: settledTransfer.status
          }
        });

        return {
          statusCode: 200,
          body: responseBody
        };
      }

      const resolvedExternalRailProvider = externalRailProvider ?? this.config.externalRailDefaultProvider;
      const clearingLedgerAccount = await this.ledgerService.findSystemLedgerAccount(tx, "CLEARING", amount.currency);
      const providerReferencePrefix = resolvedExternalRailProvider.replace(/[^a-z0-9]+/g, "_");
      const externalReference = `${providerReferencePrefix}_${transfer.id.slice(0, 8)}`;

      await tx.transferRequest.update({
        where: { id: transfer.id },
        data: {
          status: "PENDING_EXTERNAL",
          externalRailProvider: resolvedExternalRailProvider,
          externalReference
        }
      });

      await this.ledgerService.postJournalEntry(tx, {
        transferRequestId: transfer.id,
        effectiveAt: new Date(),
        sourceOperationType: "INTERBANK_TRANSFER_INITIATED",
        description: input.purpose,
        correlationId,
        idempotencyKey,
        postings: [
          {
            ledgerAccountId: sourceAccount.ledgerAccount.id,
            direction: "DEBIT",
            amount
          },
          {
            ledgerAccountId: clearingLedgerAccount.id,
            direction: "CREDIT",
            amount
          }
        ]
      });

      await tx.externalTransferEvent.create({
        data: {
          transferRequestId: transfer.id,
          provider: resolvedExternalRailProvider,
          providerEventId: `${transfer.id}:submitted`,
          eventType: "SUBMITTED",
          payload: {
            externalReference,
            destination: input.destination
          }
        }
      });

      const responseBody = {
        data: {
          transferRequestId: transfer.id,
          status: "PENDING_EXTERNAL",
          correlationId
        }
      };

      await this.idempotencyService.complete(
        tx,
        idempotency.recordId!,
        202,
        responseBody,
        "transfer_request",
        transfer.id
      );
      await this.auditService.recordInTransaction(tx, context, {
        actionType: "transfer.created",
        resourceType: "transfer_request",
        resourceId: transfer.id,
        metadata: {
          transferType,
          status: "PENDING_EXTERNAL"
        }
      });

      return {
        statusCode: 202,
        body: responseBody,
        enqueueTransferId: transfer.id,
      };
    });

    if (transactionalResult.enqueueTransferId) {
      await this.externalRailService.enqueueTransferSubmission(transactionalResult.enqueueTransferId);
    }

    return {
      statusCode: transactionalResult.statusCode,
      body: transactionalResult.body
    };
  }

  async getTransferById(transferRequestId: string, context: RequestContext) {
    const transfer = await this.prisma.transferRequest.findUnique({
      where: { id: transferRequestId },
      include: {
        sourceAccount: true,
        destinationAccount: true
      }
    });

    if (!transfer) {
      throw new AppException(404, "transfer_not_found", "Transfer request was not found.");
    }

    assertCustomerOwnsResource(context, transfer.sourceAccount.customerId);

    return {
      transferRequestId: transfer.id,
      status: transfer.status,
      amount: {
        currency: transfer.currency,
        minorUnits: Number(transfer.amountMinor)
      },
      sourceAccountId: transfer.sourceAccountId,
      destination:
        transfer.transferType === "INTERNAL"
          ? {
              type: "INTERNAL_ACCOUNT",
              accountId: transfer.destinationAccountId
            }
          : {
              type: "EXTERNAL_BANK",
              provider: transfer.externalRailProvider ?? this.config.externalRailDefaultProvider,
              bankCode: transfer.destinationExternalBankCode,
              accountNumber: transfer.destinationExternalAccountNumber,
              accountName: transfer.destinationExternalAccountName
            },
      externalReference: transfer.externalReference,
      externalRailProvider: transfer.externalRailProvider ?? this.config.externalRailDefaultProvider,
      failureReason: transfer.failureReason,
      createdAt: transfer.createdAt.toISOString(),
      settledAt: transfer.settledAt?.toISOString()
    };
  }
}
