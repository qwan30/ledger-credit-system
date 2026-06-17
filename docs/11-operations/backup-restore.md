# Backup And Restore

## Scope

The repository uses PostgreSQL through Prisma. No project-specific backup or restore scripts are currently present.

## Backup Guidance

Use standard PostgreSQL tooling appropriate for the environment, such as `pg_dump`, managed database snapshots, or storage-level backups.

Minimum backup considerations:

- Database schema and data.
- Migration history table.
- Operational retention policy for audit and ledger data.
- Secure storage of backup credentials.

## Restore Guidance

1. Provision a PostgreSQL instance.
2. Restore the backup with standard PostgreSQL tooling.
3. Confirm migrations are aligned with repository source.
4. Run readiness checks.
5. Validate critical flows in a non-production environment before accepting traffic.

Do not truncate ledger or audit tables as a repair shortcut.
