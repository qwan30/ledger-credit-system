# Ledger Credit System Map

## Summary

This repository defines a target-state TypeScript finance backend centered on a double-entry ledger, transfer orchestration, credit scoring, and end-of-day financial batch processing. The architecture is intentionally biased toward exact-money handling, append-only state reconstruction, and auditable operator behavior.

Verified documentation baseline on 2026-03-16:

- the repository contains a working NestJS backend with Prisma, auth, ledger, transfer, credit, batch, and ops modules
- the canonical stack direction and invariants come from the root `AGENTS.md`
- the original idea brief is preserved separately as a source artifact

## Target Runtime Surface

Target bounded areas:

- ledger core
- account and balance read model
- transfer orchestration
- credit scoring
- batch and close processing
- audit and compliance logging
- external banking integration
- operational administration

Target public API groups:

- transfer submission and lookup
- account balance and ledger history reads
- credit assessment submission and lookup
- batch run status visibility
- operator audit and operational review endpoints

## Bounded Area Responsibilities

### Ledger Core

- own journal entries and postings
- enforce debit and credit balancing
- reject floating-point money math
- act as the canonical source for reconstructable money movement

### Account And Balance Read Model

- project append-only ledger facts into current account balances
- support balance and statement-style queries
- avoid serving as the source of truth for mutation semantics

### Transfer Orchestration

- validate requests and idempotency keys at the boundary
- reserve, submit, settle, fail, or compensate transfer requests
- coordinate internal transfers and external bank rail requests

### Credit Scoring

- collect scoring inputs from payment history, average balance, and transaction frequency
- compute or obtain a score in the `300-850` range
- persist a traceable scoring snapshot and reason summary

### Batch And Close Processing

- run end-of-day financial close and overnight interest tasks
- process accounts in bounded batches with retry-safe progress tracking
- produce run-level evidence for later audit and operational review

### Audit And Compliance

- capture security-sensitive and money-sensitive actions
- preserve operator, approver, and system-generated evidence
- support incident review and decision replay

### External Banking Integration

- manage outbound interbank transfer requests
- ingest acknowledgements, rejections, and settlement updates
- isolate connector-specific behavior behind adapter boundaries

## End-To-End Flow Summary

### Internal Transfer

1. An authenticated client submits a transfer with an idempotency key.
2. Boundary validation checks account identity, currency, amount shape, and transfer intent.
3. Transfer orchestration creates a transfer request record and asks ledger core to create balanced postings.
4. The balance read model reflects the new ledger facts.
5. An audit event records who initiated the transfer and which outcome was returned.

### Interbank Transfer

1. A client submits a transfer to an external rail with an idempotency key.
2. The transfer request is validated and accepted into an internal pending state.
3. Ledger reservation or posting strategy is applied according to the eventual settlement model.
4. An adapter submits the external message and later records acknowledgement, settlement, or failure.
5. Compensating actions are used for failure instead of destructive rewrites.

### Credit Assessment

1. A request references the customer or account under review.
2. Credit scoring gathers historical inputs from durable financial data.
3. The service computes a score and a reason summary.
4. The decision is stored as a replayable scoring snapshot.
5. An audit record captures who requested or approved the assessment.

### End-Of-Day Batch

1. The scheduler opens a batch run at the defined close window.
2. Eligible accounts are processed in deterministic chunks.
3. Interest calculations produce journal entries rather than direct balance overwrites.
4. Failures are retried safely without duplicate money movement.
5. The batch run is closed with operational metrics and audit evidence.

## Target Invariants

- all money movement is represented through balanced journal postings
- write paths triggered from outside the system require idempotency handling
- state-changing actions leave a reconstructable audit trail
- external connector failures never justify destructive history edits
- validation occurs at handlers, adapters, or message-consumer boundaries

## Persistence And Infra Assumptions

Target assumptions, not yet implemented:

- PostgreSQL remains the primary system of record
- durable scheduler or worker infrastructure is required for batch execution
- encryption at rest and in transit is mandatory for sensitive data
- the TypeScript application may be deployed as one service with modular boundaries before any future decomposition

## Current Follow-Ups

Current operational follow-ups:

- onboard additional real-world rail providers behind the existing adapter contract
- document provider-specific callback authentication policies and key-rotation procedures
