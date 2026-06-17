# Scope

## In Scope

| Area | Included capability |
|---|---|
| Auth | Login, refresh, logout, admin principal provisioning, role bindings, external identities |
| Accounts | Balance and ledger-entry read APIs |
| Transfers | Internal transfers and interbank-style transfers through simulator/mock-bank rails |
| External rails | Provider callback ingestion and transfer event recording |
| Ledger | Double-entry journal entries, postings, balance projection, account statements |
| Credit | Credit assessment creation, scoring, under-review status, approval/rejection |
| Batch | End-of-day interest close and failed-item retry |
| Ops | Transfer lookup, event inspection, audit search, redrive, reconcile, credit review |
| Documentation | Source-backed numbered docs and root README |
| CI | Backend, contracts, Java skeleton, and web workspace checks |

## Out Of Scope

- Production bank settlement or regulatory certification.
- A full-featured public banking frontend.
- A separate microservice deployment topology.
- A complete monitoring stack unless implemented later.
- Guarantees about deployment, uptime, coverage, or audit acceptance without fresh evidence.
