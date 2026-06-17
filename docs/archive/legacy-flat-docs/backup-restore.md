# Backup and Restore Runbook

This runbook focuses on protecting the append-only ledger and supporting stores. The primary datastore is PostgreSQL, so leverage its native tooling alongside secure object storage.

## Backup Strategy

1. **Full nightly backup**: Schedule a `pg_dump` (or `pg_basebackup`) that captures the entire schema + data. Store the dump in encrypted, versioned object storage (S3, GCS, Azure Blob) tagged with the date and schema version.
2. **Point-in-time recovery (PITR)**: Archive WAL segments to the same secure storage. Confirm `archive_mode=on`, `archive_command` points to your storage bucket, and retention matches the SLAs (e.g., 30 days).
3. **Automated verification**: Every week, restore the latest backup to a disposable instance and run:
   - `prisma migrate status` (if using migrations) to ensure schema consistency.
   - A subset of critical queries defined in `tests/` (pattern: `tests/integration/backup`) to verify idempotent flows.
4. **Retention policy**: Keep at least the last 7 daily backups plus one monthly snapshot. Delete older retention safely once PITR coverage is guaranteed.

## Backup Procedure (Manual/Ad Hoc)

```sh
PGPASSWORD=<vaulted_password> pg_dump --format=custom --file=ledger-${DATE}.dump --dbname="$DATABASE_URL"
```

- Copy the dump to object storage.
- Record the checksum (e.g., `sha256sum`) in the vault along with metadata like snapshot date, schema version, and database migration hash.
- Document the backup job run in your incident log, including `git rev-parse HEAD`.

## Restore Steps

1. Provision a clean Postgres instance with the same major version.
2. Restore the base backup:
   ```sh
   pg_restore --dbname=ledger_credit_system ledger-${DATE}.dump
   ```
3. Replay WAL segments for PITR, if needed.
4. Update connection strings to point the application at the restored instance once verification completes.
5. Run smoke tests (transfer, credit, audit flows) against the restored database before switching traffic.

## Post-Restore

- Rotate credentials used during restore.
- Re-sync your metrics/observability to the new DB endpoint.
- Archive the restore log with the same metadata as the backup to maintain an audit trail.

## Backup Automation Tips

- Integrate with your scheduler (CronJob, Airflow, etc.) and ensure the job runs under a service account with least privilege.
- Use hashed object names (`{environment}-{timestamp}-{sha256}`) and store metadata in a DynamoDB/Managed Secrets table.
- Guard the backup bucket with MFA and versioning; block public access to prevent leakage.
