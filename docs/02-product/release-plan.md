# Release Plan

## Current Label

**Development documentation refresh - 2026-06-17.** This is not a production-readiness label.

## Milestones

| Milestone | Status | Evidence |
|---|---|---|
| Backend v1 implementation | Complete in source | Git history and `src/` modules |
| Java API skeleton | Present | `apps/api-java` |
| Web workspace | Present and minimal | `apps/web` |
| Evidence snapshot | Complete | `docs/reference/*` |
| Numbered docs hierarchy | In progress | `docs/README.md` and numbered folders |
| Root README | Planned in this refresh | `README.md` |
| Archive legacy flat docs | Planned after replacement docs exist | `docs/archive/legacy-flat-docs` |

## Release Gates Before Any Stronger Label

- Full local verification results recorded.
- Security review of auth, admin, transfer, external rail, credit, and secret-handling claims.
- Deployment target and environment hardening documented.
- CORS and secret defaults replaced with deployment-specific settings.
- External provider claims backed by implemented adapters and test evidence.
