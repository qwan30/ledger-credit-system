# Execution Plan: Java + Next.js Migration

Epic: java-next-migration
Generated: 2026-03-17

## Tracks

| Track | Agent | Scope | File Scope |
| --- | --- | --- | --- |
| 1 | BlueLake | Foundation and contracts | `packages/api-contracts/**`, `history/java-next-migration/**`, root workspace manifests, root CI wiring |
| 2 | GreenCastle | Java platform and auth | `apps/api-java/pom.xml`, `apps/api-java/src/main/java/**/common/**`, `**/config/**`, `**/auth/**`, `src/test/java/**/common/**`, `src/main/resources/**` |
| 3 | RedStone | Java finance core parity | `apps/api-java/src/main/java/**/ledger/**`, `**/accounts/**`, `**/transfers/**`, `**/audit/**`, `**/integrations/**`, matching tests |
| 4 | SilverComet | Java credit, batch, ops, query APIs | `apps/api-java/src/main/java/**/credit/**`, `**/batch/**`, `**/ops/**`, portal-read-model packages, matching tests |
| 5 | AmberField | Web foundation and customer portal | `apps/web/package.json`, `apps/web/src/app/(auth)/**`, `apps/web/src/app/(customer)/**`, `apps/web/src/components/**`, `apps/web/src/lib/**`, `apps/web/src/hooks/**` |
| 6 | IronHarbor | Web operator portal and cutover | `apps/web/src/app/(ops)/**`, `apps/web/src/app/(admin)/**`, `apps/web/src/app/(analyst)/**`, `apps/web/src/app/(auditor)/**`, `deploy/**`, `.github/workflows/**` |

## Cross-Track Dependencies

- Track 1 must complete before all others.
- Tracks 2 and 5 may run in parallel after Track 1.
- Track 3 depends on Track 2.
- Track 4 depends on Tracks 2 and 3.
- Track 6 depends on Tracks 4 and 5.

## Agent Skill Stack

- Track 1:
  - `planning`
  - `api-design`
  - `coding-standards`
- Tracks 2-4:
  - `tdd-workflow`
  - `api-design`
  - `backend-patterns`
  - `springboot-patterns`
  - `springboot-security`
  - `springboot-tdd`
  - `security-review`
  - `verification-loop`
- Tracks 5-6:
  - `frontend-patterns`
  - `api-design`
  - `coding-standards`
  - `security-review`
  - `verification-loop`
- Track 6 additionally:
  - `deployment-patterns`

## Cutover Order

1. `health`
2. `auth`
3. `accounts`
4. `transfers`
5. `credit`
6. `batch/ops`
7. `external integrations`
