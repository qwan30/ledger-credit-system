# Release Checklist

Follow this checklist before tagging or deploying a release build to production.

1. **Code & Tests**
   - Run `npm run lint` (or `npm run typecheck`) to ensure the codebase is clean.
   - Run `npm run test:unit` and `npm run test:integration` in CI to validate business rules and idempotency guarantees.
   - Verify any schema changes are captured in `prisma/migrations` and the migrations are applied in CI.

2. **Docker & Build**
   - Build the multi-stage Docker image and push it to the artifact repository with a release tag (semver or Git SHA).
   - Confirm `npm run build` succeeds and that `dist/` contains the compiled NestJS server.
   - Validate the image starts with `node dist/src/main.js` and responds to `/api/v1/health/live` and `/api/v1/health/ready`.

3. **Documentation & Runbooks**
   - Update `deployment-environment.md` and `runtime-operations.md` if runtime contracts changed.
   - Document any new environment variables, secrets, or database requirements in the same docs.
   - Review `backup-restore.md` and `disaster-recovery.md` for required adjustments.
   - Confirm `release-checklist.md` mirrors the newly executed release steps.

4. **Deployment Artifacts**
   - Update `deploy/templates/*` with the new image tag, resource hints, or configuration.
   - Store templated config/secret values in your pipeline (e.g., GitHub Secrets, Vault, or GitOps overlay).
   - Ensure the release pipeline runs `kubectl apply` (or equivalent) against the correct namespace.

5. **Post-Release Verification**
   - Monitor logs for errors or timeouts in the first 20 minutes after deployment.
   - Run a canary smoke test that performs a transfer, a credit assessment submission plus review action, and a batch-run trigger.
   - Archive the release log (Git SHA, artifact location, incident references) for auditability.
