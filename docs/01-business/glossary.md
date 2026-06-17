# Glossary

| Term | Definition | Source anchor |
|---|---|---|
| Money | Currency-specific value represented without floating-point arithmetic | `src/common/money/money.ts` |
| `minorUnits` | Integer minor-unit amount such as cents | Prisma `amountMinor` fields |
| `JournalEntry` | Append-only ledger entry containing balanced postings | `prisma/schema.prisma` |
| `Posting` | Debit or credit line in a journal entry | `prisma/schema.prisma` |
| `LedgerAccount` | Ledger account tied to a customer account or internal category | `prisma/schema.prisma` |
| `TransferRequest` | Durable transfer command and lifecycle record | `prisma/schema.prisma` |
| `IdempotencyRecord` | Durable idempotency state for retry-safe operations | `prisma/schema.prisma` |
| `CreditProfileSnapshot` | Point-in-time credit input snapshot | `prisma/schema.prisma` |
| `CreditAssessment` | Credit decision workflow record | `prisma/schema.prisma` |
| `BatchRun` | Batch job execution record | `prisma/schema.prisma` |
| `BatchRunItem` | Per-resource batch item with retry status | `prisma/schema.prisma` |
| `ExternalTransferEvent` | Provider callback or rail lifecycle event | `prisma/schema.prisma` |
| `AuditEvent` | Append-only event for reconstructing state changes | `prisma/schema.prisma` |
| Correlation ID | Request or workflow trace identifier | `src/bootstrap.ts` |
| Idempotency key | Client-provided key used to prevent duplicate writes | Transfer and credit controllers/services |
