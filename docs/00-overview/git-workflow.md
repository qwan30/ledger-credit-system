# Git Workflow

## Branches

Use a short-lived branch for each documentation or implementation change. This refresh is being performed on `docs/readme-refresh` to avoid writing directly to `master`.

## Commits

Prefer small commits grouped by document area:

| Change type | Commit example |
|---|---|
| Evidence snapshots | `docs: add source evidence snapshots` |
| Index/taxonomy | `docs: establish documentation index` |
| Foundation docs | `docs: add project foundation and requirements` |
| Architecture/API/database | `docs: document architecture api and database` |
| Flows/ops/handover | `docs: add flows testing deployment and handover` |
| Root README | `docs: add project readme` |
| Archive cleanup | `docs: archive legacy flat documentation` |

## Review Expectations

- Read changed docs against source anchors before merging.
- For docs-only changes, run `git diff --check` and targeted scans for unsupported claims.
- For backend behavior changes, run the repository verification scripts that match the change risk.
- Auth, admin, credit, transfer, external rail, ledger, and secret-related changes require security review.

## Pull Request Checklist

- Explain whether the change is docs-only or source-changing.
- List verification commands and exact results.
- Note any environment blockers instead of implying checks passed.
- Keep old documentation archived when replacing canonical docs.
