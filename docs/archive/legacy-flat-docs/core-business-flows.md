# Core Business Flows

**Last Updated:** 2026-03-15

## Internal Transfer

1. A client submits a transfer request between two in-platform accounts with an idempotency key.
2. The boundary validates actor authorization, account references, currency, amount format, and transfer purpose.
3. A transfer request is recorded in a pending lifecycle state.
4. Ledger core writes balanced postings for the debit and credit sides of the transfer.
5. The transfer request moves to a successful terminal state once ledger persistence succeeds.
6. The balance read model and audit trail are updated from the committed facts.

## Interbank Transfer

1. A client submits a transfer request targeting an external destination.
2. The request is validated and stored with replay-safe idempotency state.
3. The system records the internal transfer intent and applies the required reservation or posting strategy.
4. The external rail adapter sends the outbound message.
5. The transfer request moves through acknowledgement, settlement, failure, or compensation states.
6. Any failure after partial progress is handled through compensating actions and audit evidence, not by rewriting history.

## Credit Assessment

1. An authorized actor or internal process requests a credit assessment for a customer.
2. The service gathers payment history, average balance, and transaction frequency.
3. The system computes a score in the `300-850` range and persists a scoring snapshot.
4. The result and decision rationale are returned or stored for later approval.
5. An audit event records who initiated or reviewed the assessment.

## End-Of-Day Interest Batch

1. The scheduler opens a new end-of-day batch run at the configured close window.
2. Eligible accounts are discovered and partitioned into deterministic chunks.
3. Interest or close-related calculations are performed using exact-money arithmetic.
4. Journal entries are written for each approved financial effect.
5. Retryable failures are reprocessed safely without duplicating postings.
6. The batch run completes with metrics, audit evidence, and any remaining exception records.

## Audit Review Path

1. A privileged operator or auditor searches for a transfer, credit decision, or batch run.
2. The system returns correlated records from the transfer lifecycle, ledger, and audit store.
3. The reviewer inspects who acted, what changed, when it changed, and under which correlation or idempotency key.
4. Any remediation action is tracked as a new auditable event.

## Flow Coupling Notes

- transfer flows depend on business rules in `business-rules.md`
- state transitions are defined in `state-machine.md`
- durable entities are defined in `data-model.md`
- public request and response expectations are defined in `api-contract.md`
