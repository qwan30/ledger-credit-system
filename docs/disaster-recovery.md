# Disaster Recovery Runbook

This runbook covers catastrophic failures such as region-wide outages or corrupted databases. It complements the backup/restore plan by focusing on recovery coordination, traffic cutover, and communication.

## Principles

- Keep the `ledger-credit-system` database and artifacts immutable; prefer failover/new clusters over in-place repair.
- Use documented automation (CI/CD pipelines, infra-as-code) so recovery steps can run repeatably.
- Communicate each stage to stakeholders (ops, finance, compliance) via your incident channel.

## Recovery Steps

1. **Declare incident**: Notify the response team, record the incident ID, and escalate to finance/ops leads.
2. **Assess scope**: Confirm whether only the service is down (app) or the Postgres cluster is compromised.
3. **Failover preparation**:
   - If Postgres is healthy but app pods are unstable, rebuild the image locally and redeploy using the `app-deployment.yaml` template.
   - If DB is compromised, follow `docs/backup-restore.md` restore steps into a new cluster (target region or availability zone).
4. **Infrastructure bring-up**:
   - Create the new namespace/cluster if needed.
   - Apply `deploy/templates/configmap.yaml` and `secret-template.yaml` with the target environment values.
   - Deploy the application using the multi-stage Docker image.
5. **Smoke test**:
   - Validate ledger operations with idempotent requests.
   - Confirm batch jobs can list accounts and compute interest.
6. **Cut traffic**:
   - Update DNS/Ingress to point to the new service.
   - If using feature flags or route weights, incrementally divert traffic from the failing location.
7. **Audit & handoff**:
   - Document the incident timeline, recovery steps, and any data loss or rollbacks in your incident tracker.
   - Schedule a post-mortem review with finance, compliance, and platform teams.

## Recovery Checklist

| Step | Owner | Notes |
| --- | --- | --- |
| Confirm backups | DBA | Validate the timestamp of the latest clean dump. |
| Provision new DB | Platform | Match Postgres major version; configure WAL archiving. |
| Apply secrets | Security | Rotate `JWT_SECRET` if rotation was part of the incident. |
| Redeploy service | DevOps | Use the templated manifests and verify readiness/liveness. |
| Smoke test | QA/Ops | Run credit scoring and transfer flows under load. |
| Cut traffic | Network | Monitor aggregator dashboards and error rates. |

## Post-Recovery

- Freeze the recovery environment and snapshot it for compliance.
- Re-run `npm run test:integration` or other relevant suites against the restored dataset to prove readiness.
- Update runbooks if any manual step was missing, and add missing automation as action items.
