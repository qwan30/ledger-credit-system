# UI Roles

**Last Updated:** 2026-03-15

This is a backend-first project, but the platform still implies role-specific user surfaces or operator consoles.

## End Customer

Needs:

- view balances
- inspect transfer status
- request transfers
- view credit-assessment outcomes if product policy permits

## Operations User

Needs:

- inspect batch run outcomes
- review transfer exceptions
- view retry-safe remediation options

## Credit Analyst Or Approver

Needs:

- inspect score inputs and rationale
- review queued or borderline credit decisions
- approve or reject when manual workflow exists

## Compliance Or Auditor

Needs:

- read-only access to ledger history, audit events, and decision evidence
- correlated views across transfer, scoring, and batch records

## System Administrator

Needs:

- manage configuration and integration health
- inspect scheduler behavior and operational dependencies

## Role Guardrails

- customer-facing roles should not expose internal audit or remediation controls
- operator and admin actions should always be attributable
- auditor access should be broad for reads but narrow for mutation
