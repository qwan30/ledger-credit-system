-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'CLOSED');

-- CreateEnum
CREATE TYPE "LedgerAccountCategory" AS ENUM ('CUSTOMER', 'CASH', 'CLEARING', 'EXTERNAL_SETTLEMENT', 'INTEREST_REVENUE', 'INTERNAL_SUSPENSE');

-- CreateEnum
CREATE TYPE "NormalBalanceDirection" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "PostingDirection" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "TransferType" AS ENUM ('INTERNAL', 'INTERBANK');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('RECEIVED', 'VALIDATED', 'PENDING_LEDGER', 'PENDING_EXTERNAL', 'SETTLED', 'FAILED', 'COMPENSATED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CreditAssessmentStatus" AS ENUM ('REQUESTED', 'DATA_COLLECTED', 'SCORED', 'APPROVED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "BatchRunStatus" AS ENUM ('SCHEDULED', 'RUNNING', 'PARTIALLY_FAILED', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BatchRunItemStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('CUSTOMER', 'OPS', 'ANALYST', 'AUDITOR', 'ADMIN', 'SYSTEM', 'API_CLIENT');

-- CreateEnum
CREATE TYPE "ExternalTransferEventType" AS ENUM ('SUBMITTED', 'ACKNOWLEDGED', 'SETTLED', 'FAILED', 'COMPENSATED');

-- CreateEnum
CREATE TYPE "IdempotencyStatus" AS ENUM ('IN_PROGRESS', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "customer" (
    "id" UUID NOT NULL,
    "externalRef" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "AccountStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_account" (
    "id" UUID NOT NULL,
    "accountId" UUID,
    "category" "LedgerAccountCategory" NOT NULL,
    "currency" TEXT NOT NULL,
    "normalBalanceDirection" "NormalBalanceDirection" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entry" (
    "id" UUID NOT NULL,
    "transferRequestId" UUID,
    "batchRunId" UUID,
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "sourceOperationType" TEXT NOT NULL,
    "correlationId" TEXT,
    "idempotencyKey" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posting" (
    "id" UUID NOT NULL,
    "journalEntryId" UUID NOT NULL,
    "ledgerAccountId" UUID NOT NULL,
    "amountMinor" BIGINT NOT NULL,
    "currency" TEXT NOT NULL,
    "direction" "PostingDirection" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_request" (
    "id" UUID NOT NULL,
    "transferType" "TransferType" NOT NULL,
    "status" "TransferStatus" NOT NULL,
    "sourceAccountId" UUID NOT NULL,
    "destinationAccountId" UUID,
    "destinationExternalBankCode" TEXT,
    "destinationExternalAccountNumber" TEXT,
    "destinationExternalAccountName" TEXT,
    "amountMinor" BIGINT NOT NULL,
    "currency" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "correlationId" TEXT,
    "externalReference" TEXT,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "settledAt" TIMESTAMP(3),

    CONSTRAINT "transfer_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_record" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "operationType" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "status" "IdempotencyStatus" NOT NULL,
    "responseStatusCode" INTEGER,
    "responseBody" JSONB,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "idempotency_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_profile_snapshot" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "paymentHistoryPoints" INTEGER NOT NULL,
    "averageBalanceMinor" BIGINT NOT NULL,
    "transactionFrequency" INTEGER NOT NULL,
    "snapshotVersion" TEXT NOT NULL,
    "snapshotData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_profile_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_assessment" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "creditProfileSnapshotId" UUID NOT NULL,
    "status" "CreditAssessmentStatus" NOT NULL,
    "score" INTEGER,
    "rationaleSummary" TEXT,
    "policyVersion" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "approvedThreshold" INTEGER NOT NULL,
    "rejectedThreshold" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_run" (
    "id" UUID NOT NULL,
    "batchType" TEXT NOT NULL,
    "status" "BatchRunStatus" NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "processedCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "failureSummary" JSONB,
    "correlationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_run_item" (
    "id" UUID NOT NULL,
    "batchRunId" UUID NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "shardKey" TEXT NOT NULL,
    "status" "BatchRunItemStatus" NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_run_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_event" (
    "id" UUID NOT NULL,
    "actorType" "ActorType" NOT NULL,
    "actorId" TEXT,
    "actionType" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "correlationId" TEXT,
    "idempotencyKey" TEXT,
    "metadata" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_transfer_event" (
    "id" UUID NOT NULL,
    "transferRequestId" UUID NOT NULL,
    "eventType" "ExternalTransferEventType" NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "external_transfer_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_projection" (
    "accountId" UUID NOT NULL,
    "currency" TEXT NOT NULL,
    "currentMinor" BIGINT NOT NULL,
    "journalEntryId" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "balance_projection_pkey" PRIMARY KEY ("accountId")
);

-- CreateTable
CREATE TABLE "account_statement_projection" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "journalEntryId" UUID NOT NULL,
    "postingId" UUID NOT NULL,
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "amountMinor" BIGINT NOT NULL,
    "currency" TEXT NOT NULL,
    "direction" "PostingDirection" NOT NULL,
    "runningBalanceMinor" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_statement_projection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_externalRef_key" ON "customer"("externalRef");

-- CreateIndex
CREATE INDEX "account_customerId_idx" ON "account"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_account_accountId_key" ON "ledger_account"("accountId");

-- CreateIndex
CREATE INDEX "ledger_account_category_currency_idx" ON "ledger_account"("category", "currency");

-- CreateIndex
CREATE INDEX "journal_entry_transferRequestId_idx" ON "journal_entry"("transferRequestId");

-- CreateIndex
CREATE INDEX "journal_entry_batchRunId_idx" ON "journal_entry"("batchRunId");

-- CreateIndex
CREATE INDEX "journal_entry_correlationId_idx" ON "journal_entry"("correlationId");

-- CreateIndex
CREATE INDEX "posting_journalEntryId_idx" ON "posting"("journalEntryId");

-- CreateIndex
CREATE INDEX "posting_ledgerAccountId_idx" ON "posting"("ledgerAccountId");

-- CreateIndex
CREATE INDEX "transfer_request_sourceAccountId_idx" ON "transfer_request"("sourceAccountId");

-- CreateIndex
CREATE INDEX "transfer_request_destinationAccountId_idx" ON "transfer_request"("destinationAccountId");

-- CreateIndex
CREATE INDEX "transfer_request_status_idx" ON "transfer_request"("status");

-- CreateIndex
CREATE INDEX "transfer_request_correlationId_idx" ON "transfer_request"("correlationId");

-- CreateIndex
CREATE UNIQUE INDEX "transfer_request_idempotencyKey_key" ON "transfer_request"("idempotencyKey");

-- CreateIndex
CREATE INDEX "idempotency_record_resourceType_resourceId_idx" ON "idempotency_record"("resourceType", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_record_operationType_key_key" ON "idempotency_record"("operationType", "key");

-- CreateIndex
CREATE INDEX "credit_profile_snapshot_customerId_idx" ON "credit_profile_snapshot"("customerId");

-- CreateIndex
CREATE INDEX "credit_assessment_customerId_idx" ON "credit_assessment"("customerId");

-- CreateIndex
CREATE INDEX "credit_assessment_status_idx" ON "credit_assessment"("status");

-- CreateIndex
CREATE INDEX "batch_run_batchType_scheduledFor_idx" ON "batch_run"("batchType", "scheduledFor");

-- CreateIndex
CREATE INDEX "batch_run_status_idx" ON "batch_run"("status");

-- CreateIndex
CREATE INDEX "batch_run_item_batchRunId_status_idx" ON "batch_run_item"("batchRunId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "batch_run_item_batchRunId_resourceType_resourceId_key" ON "batch_run_item"("batchRunId", "resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "audit_event_resourceType_resourceId_idx" ON "audit_event"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "audit_event_correlationId_idx" ON "audit_event"("correlationId");

-- CreateIndex
CREATE INDEX "audit_event_actorType_actorId_idx" ON "audit_event"("actorType", "actorId");

-- CreateIndex
CREATE INDEX "external_transfer_event_transferRequestId_eventType_idx" ON "external_transfer_event"("transferRequestId", "eventType");

-- CreateIndex
CREATE UNIQUE INDEX "account_statement_projection_postingId_key" ON "account_statement_projection"("postingId");

-- CreateIndex
CREATE INDEX "account_statement_projection_accountId_effectiveAt_idx" ON "account_statement_projection"("accountId", "effectiveAt");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_account" ADD CONSTRAINT "ledger_account_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry" ADD CONSTRAINT "journal_entry_transferRequestId_fkey" FOREIGN KEY ("transferRequestId") REFERENCES "transfer_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry" ADD CONSTRAINT "journal_entry_batchRunId_fkey" FOREIGN KEY ("batchRunId") REFERENCES "batch_run"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posting" ADD CONSTRAINT "posting_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "journal_entry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posting" ADD CONSTRAINT "posting_ledgerAccountId_fkey" FOREIGN KEY ("ledgerAccountId") REFERENCES "ledger_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_request" ADD CONSTRAINT "transfer_request_sourceAccountId_fkey" FOREIGN KEY ("sourceAccountId") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_request" ADD CONSTRAINT "transfer_request_destinationAccountId_fkey" FOREIGN KEY ("destinationAccountId") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_profile_snapshot" ADD CONSTRAINT "credit_profile_snapshot_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_assessment" ADD CONSTRAINT "credit_assessment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_assessment" ADD CONSTRAINT "credit_assessment_creditProfileSnapshotId_fkey" FOREIGN KEY ("creditProfileSnapshotId") REFERENCES "credit_profile_snapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_run_item" ADD CONSTRAINT "batch_run_item_batchRunId_fkey" FOREIGN KEY ("batchRunId") REFERENCES "batch_run"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_transfer_event" ADD CONSTRAINT "external_transfer_event_transferRequestId_fkey" FOREIGN KEY ("transferRequestId") REFERENCES "transfer_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_projection" ADD CONSTRAINT "balance_projection_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_statement_projection" ADD CONSTRAINT "account_statement_projection_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_statement_projection" ADD CONSTRAINT "account_statement_projection_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "journal_entry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_statement_projection" ADD CONSTRAINT "account_statement_projection_postingId_fkey" FOREIGN KEY ("postingId") REFERENCES "posting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
