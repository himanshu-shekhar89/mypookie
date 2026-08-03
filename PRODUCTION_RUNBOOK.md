# mypookie production runbook

## Health and incident checks

- Frontend: `https://mypookie.store/`
- Backend and database readiness: `https://backend-production-22bd.up.railway.app/api/health`
- Railway must only route a new deployment after its configured health check succeeds.
- Every backend response includes `X-Request-Id`; search Railway logs for that value when investigating an error.
- Review Railway CPU, memory, network, and HTTP metrics after every release and during incidents.

## Database backup and recovery

1. Enable scheduled backups for the production MySQL service in Railway and retain at least seven daily restore points.
2. Before a destructive migration, create an on-demand backup and record its timestamp in the release notes.
3. Once per quarter, restore the newest backup into an isolated non-production MySQL service.
4. Run `/api/health`, verify the Flyway schema version, and inspect gift/order counts before declaring the restore valid.
5. Never test restoration against the production database.

## Release rollback

1. Stop rollout if either health check fails or HTTP 5xx responses rise after deployment.
2. Redeploy the last known-good tagged release from Railway.
3. Do not roll back a database migration until its compatibility and data-loss impact have been reviewed.
4. Confirm frontend, backend readiness, authentication, checkout, and a private gift open after rollback.

## Alerts to configure in Railway

- Deployment crashed or health check failed.
- Sustained HTTP 5xx responses.
- CPU or memory saturation.
- MySQL storage nearing capacity.
- Backup failure or missing scheduled restore point.

## Known beta limitation

- The pale-pink visual system currently has 37 automated WCAG color-contrast findings on the landing page. Structural serious/critical accessibility checks are enforced in Playwright, but public launch should wait for an approved accessible palette and a manual keyboard/screen-reader review.
