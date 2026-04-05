-- CreateEnum
CREATE TYPE "AuthPrincipalStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "AuthCredentialType" AS ENUM ('PASSWORD');

-- CreateEnum
CREATE TYPE "AuthSessionStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateTable
CREATE TABLE "auth_principal" (
    "id" UUID NOT NULL,
    "loginId" TEXT,
    "actorType" "ActorType" NOT NULL,
    "actorId" TEXT NOT NULL,
    "customerId" UUID,
    "status" "AuthPrincipalStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_principal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_credential" (
    "id" UUID NOT NULL,
    "principalId" UUID NOT NULL,
    "type" "AuthCredentialType" NOT NULL,
    "secretHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rotatedAt" TIMESTAMP(3),

    CONSTRAINT "auth_credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_session" (
    "id" UUID NOT NULL,
    "principalId" UUID NOT NULL,
    "audience" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "status" "AuthSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "refreshExpiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "lastRefreshedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_token" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedByTokenId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_identity" (
    "id" UUID NOT NULL,
    "principalId" UUID NOT NULL,
    "issuer" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_identity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_binding" (
    "id" UUID NOT NULL,
    "principalId" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_binding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_principal_loginId_key" ON "auth_principal"("loginId");

-- CreateIndex
CREATE UNIQUE INDEX "auth_principal_customerId_key" ON "auth_principal"("customerId");

-- CreateIndex
CREATE INDEX "auth_principal_actorType_actorId_idx" ON "auth_principal"("actorType", "actorId");

-- CreateIndex
CREATE INDEX "auth_credential_principalId_type_idx" ON "auth_credential"("principalId", "type");

-- CreateIndex
CREATE INDEX "auth_session_principalId_status_audience_idx" ON "auth_session"("principalId", "status", "audience");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_tokenHash_key" ON "refresh_token"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_replacedByTokenId_key" ON "refresh_token"("replacedByTokenId");

-- CreateIndex
CREATE INDEX "refresh_token_sessionId_revokedAt_idx" ON "refresh_token"("sessionId", "revokedAt");

-- CreateIndex
CREATE INDEX "external_identity_principalId_idx" ON "external_identity"("principalId");

-- CreateIndex
CREATE UNIQUE INDEX "external_identity_issuer_subject_key" ON "external_identity"("issuer", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "role_binding_principalId_role_key" ON "role_binding"("principalId", "role");

-- AddForeignKey
ALTER TABLE "auth_principal" ADD CONSTRAINT "auth_principal_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_credential" ADD CONSTRAINT "auth_credential_principalId_fkey" FOREIGN KEY ("principalId") REFERENCES "auth_principal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_principalId_fkey" FOREIGN KEY ("principalId") REFERENCES "auth_principal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "auth_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_replacedByTokenId_fkey" FOREIGN KEY ("replacedByTokenId") REFERENCES "refresh_token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_identity" ADD CONSTRAINT "external_identity_principalId_fkey" FOREIGN KEY ("principalId") REFERENCES "auth_principal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_binding" ADD CONSTRAINT "role_binding_principalId_fkey" FOREIGN KEY ("principalId") REFERENCES "auth_principal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
