# Project Context

The system exists to demonstrate auditable finance backend patterns: exact money arithmetic, append-only ledger postings, idempotent transfer submission, credit-decision traceability, and retry-safe operational workflows.

## Problem Statement

Finance systems need correctness under retry, auditability after incidents, and deterministic money movement. This repository models those concerns through a compact backend instead of a broad consumer banking product.

## Stakeholders

| Stakeholder | Need |
|---|---|
| Customer | Submit transfers and request credit assessments through authenticated flows |
| Operator | Inspect and reconcile transfers, retry batch work, and redrive operational failures |
| Analyst | Review credit assessment decisions and supporting profile snapshots |
| Auditor | Search audit events and reconstruct state-changing operations |
| Admin | Provision principals, role bindings, and external identities |
| API client | Integrate with documented route groups and idempotency rules |
| External rail provider | Send callback events through the rail integration endpoint |

## Implementation Scope

The current code includes a NestJS backend, Prisma schema and migrations, OpenAPI contract workspace, minimal Next.js workspace, Java health skeleton, and CI jobs for backend, contracts, web, and Java.

## Current Limits

- Production deployment evidence is not present.
- External settlement is represented by simulator/mock-bank adapters.
- The web workspace is minimal and not a full operations console.
- CORS defaults are permissive for local development and need tightening before deployment.
- Strong documentation claims should be refreshed from source before reuse.
