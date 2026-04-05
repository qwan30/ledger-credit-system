ALTER TYPE "CreditAssessmentStatus" ADD VALUE IF NOT EXISTS 'UNDER_REVIEW';

ALTER TABLE "transfer_request"
ADD COLUMN "externalRailProvider" TEXT DEFAULT 'simulator';

ALTER TABLE "credit_assessment"
ADD COLUMN "reviewedByActorId" TEXT,
ADD COLUMN "reviewedByActorType" "ActorType",
ADD COLUMN "reviewDecisionedAt" TIMESTAMP(3),
ADD COLUMN "reviewRationale" TEXT;

ALTER TABLE "external_transfer_event"
ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'simulator',
ADD COLUMN "providerEventId" TEXT;

CREATE INDEX "transfer_request_externalRailProvider_externalReference_idx"
ON "transfer_request"("externalRailProvider", "externalReference");

CREATE UNIQUE INDEX "external_transfer_event_provider_providerEventId_key"
ON "external_transfer_event"("provider", "providerEventId");
