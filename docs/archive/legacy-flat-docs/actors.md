# Actors

**Last Updated:** 2026-03-15

## Business Actors

### Customer

Responsibilities:

- initiate internal or interbank transfer requests
- view balances and transfer status
- become the subject of credit assessment

Sensitivity:

- may trigger money-moving actions
- may access sensitive financial data only within their authorization scope

### Credit Analyst Or Approver

Responsibilities:

- request or review a customer credit assessment
- inspect scoring evidence and rationale
- approve or reject credit decisions if manual review remains in scope

Sensitivity:

- touches credit decisions and potentially privileged data

### Operations User

Responsibilities:

- monitor batch runs, transfer failures, and operational anomalies
- trigger approved remediation actions
- inspect non-sensitive operational health and replay state

### Compliance Or Auditor

Responsibilities:

- inspect ledger history and audit evidence
- verify that sensitive actions were attributable and reconstructable
- support incident and regulatory review

## System Actors

### API Client

- authenticated machine or frontend caller using the public API surface

### Scheduler

- triggers end-of-day close and future operational automations

### Credit Scoring Engine

- computes or brokers the score and reason summary used by the platform

### External Bank Rail

- receives interbank transfer instructions and returns acknowledgement or settlement outcomes

### Audit Logger

- persists immutable audit evidence for sensitive actions and system events

## Role Boundaries

- customers should not access privileged operator or audit endpoints
- operations users may inspect and remediate but should not rewrite historical ledger facts
- compliance and audit roles require broad read visibility but not mutation authority
- credit approvers require decision visibility without unrestricted money-movement privileges by default

## Open Questions

- whether credit approval is fully automated or includes a mandatory human gate for certain thresholds
- whether operations and compliance roles are split across separate auth domains or one shared admin identity model
