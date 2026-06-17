# Database Schema

## Enums

| Enum | Values |
|---|---|
| `AccountStatus` | `ACTIVE`, `BLOCKED`, `CLOSED` |
| `LedgerAccountCategory` | `CUSTOMER`, `CASH`, `CLEARING`, `EXTERNAL_SETTLEMENT`, `INTEREST_REVENUE`, `INTERNAL_SUSPENSE` |
| `NormalBalanceDirection` | `DEBIT`, `CREDIT` |
| `PostingDirection` | `DEBIT`, `CREDIT` |
| `TransferType` | `INTERNAL`, `INTERBANK` |
| `TransferStatus` | `RECEIVED`, `VALIDATED`, `PENDING_LEDGER`, `PENDING_EXTERNAL`, `SETTLED`, `FAILED`, `COMPENSATED`, `CANCELLED` |
| `CreditAssessmentStatus` | `REQUESTED`, `DATA_COLLECTED`, `SCORED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `FAILED` |
| `BatchRunStatus` | `SCHEDULED`, `RUNNING`, `PARTIALLY_FAILED`, `COMPLETED`, `FAILED`, `CANCELLED` |
| `BatchRunItemStatus` | `PENDING`, `RUNNING`, `COMPLETED`, `FAILED` |
| `ActorType` | `CUSTOMER`, `OPS`, `ANALYST`, `AUDITOR`, `ADMIN`, `SYSTEM`, `API_CLIENT` |
| `ExternalTransferEventType` | `SUBMITTED`, `ACKNOWLEDGED`, `SETTLED`, `FAILED`, `COMPENSATED` |
| `IdempotencyStatus` | `IN_PROGRESS`, `SUCCEEDED`, `FAILED` |
| `AuthPrincipalStatus` | `ACTIVE`, `DISABLED` |
| `AuthCredentialType` | `PASSWORD` |
| `AuthSessionStatus` | `ACTIVE`, `REVOKED`, `EXPIRED` |

## Models

| Model | Purpose | Key relationships |
|---|---|---|
| `Customer` | Customer aggregate root | Accounts, auth principal, credit snapshots, assessments |
| `Account` | Customer account | Customer, ledger account, balance projection, transfer relations |
| `LedgerAccount` | Ledger account | Optional customer account, postings |
| `JournalEntry` | Balanced ledger event | Postings, transfer request, batch run, statement lines |
| `Posting` | Debit/credit journal line | Journal entry, ledger account, statement line |
| `TransferRequest` | Transfer command and lifecycle record | Source/destination accounts, journal entries, external events |
| `IdempotencyRecord` | Durable retry state | Unique by operation type and key |
| `AuthPrincipal` | Login identity | Customer, credentials, sessions, external identities, roles |
| `AuthCredential` | Hashed credential | Auth principal |
| `AuthSession` | Login session | Principal and refresh tokens |
| `RefreshToken` | Rotating refresh token record | Session and replacement token |
| `ExternalIdentity` | OIDC/external subject mapping | Auth principal |
| `RoleBinding` | Role assignment | Auth principal |
| `CreditProfileSnapshot` | Point-in-time credit input | Customer and assessments |
| `CreditAssessment` | Credit decision workflow | Customer and profile snapshot |
| `BatchRun` | Batch execution summary | Items and journal entries |
| `BatchRunItem` | Per-resource batch work item | Batch run |
| `AuditEvent` | Append-only audit event | Actor, resource, correlation, idempotency metadata |
| `ExternalTransferEvent` | Provider transfer event | Transfer request |
| `BalanceProjection` | Current balance read model | Account |
| `AccountStatementProjection` | Statement line read model | Account, journal entry, posting |

## Source Rule

`prisma/schema.prisma` is the source of truth for model names, relations, indexes, and enum values.
