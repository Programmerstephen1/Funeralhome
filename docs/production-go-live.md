# Production Go-Live Gates

This document is the release checklist for the five outstanding production
workstreams. A code change or a passing local test does not count as a production
gate until the evidence in the final column is recorded for the target environment.

## Gate 1 — Provision and verify durable services

Provision managed PostgreSQL, Redis, and a private S3-compatible bucket in the
same hosting region. Configure secrets in the hosting provider's secret manager;
never in Git, Docker build arguments, or `VITE_*` variables. Render provisions
Redis through `render.yaml`; PostgreSQL and the storage bucket are external
resources and must be attached separately.

Required runtime values:

| Setting | Required validation |
| --- | --- |
| `DATABASE_URL` | Managed PostgreSQL URL; TLS enabled; application role is least-privilege |
| `REDIS_URL` | Render internal Redis URL; production startup and `/api/health/ready` succeed |
| `OBJECT_STORAGE_BUCKET` and credentials | Private bucket; service user scoped to object operations on this bucket |
| `SECRET_KEY`, `JWT_SECRET_KEY` | Separate high-entropy values; stable across deploys |
| `MPESA_CALLBACK_TOKEN` | High-entropy callback secret; provision the same token in Safaricom callback configuration |
| `FRONTEND_URL` / `VITE_SITE_URL` | Identical canonical HTTPS origin |
| `MAIL_*` | Provider credentials verified with delivery and bounce handling |

Run a deployment smoke check against the target service:

```powershell
Invoke-RestMethod https://<production-host>/api/health/live
Invoke-RestMethod https://<production-host>/api/health/ready
```

Readiness must confirm both PostgreSQL and Redis. Upload one non-sensitive test
image, verify its object metadata and signed read URL, then delete it and verify
the object is gone. Confirm the bucket's public access block and lifecycle/backup
policy in the provider console.

**Pass evidence:** secret inventory (names only), health responses, bucket privacy
settings, and successful put/read/delete verification. No secret values go in the
release record.

## Gate 2 — Migrate schema and local uploads without data loss

The requested live target is Neon project `morning-butterfly-23991661`, branch
`br-wandering-heart-atvywu8c`. Before any command runs, verify the private
`DATABASE_URL` host and database identify that branch. Use its direct (non-pooled)
connection for Alembic DDL and require TLS; do not run against another branch or
the local SQLite fallback.

Take a PostgreSQL backup and demonstrate that it can be restored to an isolated
database before changing the production schema. Identify the actual runtime that
owns the legacy upload directory. Container-local files are ephemeral: files in
this developer checkout are not proof that production uploads have been copied.

With the production configuration pointed at a staging clone, run the expand
migration and inspect the resulting schema and representative records:

```powershell
Set-Location backend
flask --app run:app db upgrade 0002_hardened_data
flask --app run:app db current
```

Confirm money columns use `NUMERIC(12,2)`, memorial hash columns are populated,
callback audit tables exist, and the legacy plaintext credential columns remain
only during the compatibility window. Then copy the upload source to a protected
workstation or secure transfer location, and run the resumable object migration:

```powershell
python -m scripts.migrate_uploads_to_object_storage --source-dir <verified-source> --dry-run
python -m scripts.migrate_uploads_to_object_storage --source-dir <verified-source> --apply
```

Resolve every `MISSING` item. Verify object size and SHA-256 values, open a sample
of signed URLs, and preserve the original source until the release is accepted.
Deploy the hash-only application, wait until every old instance is drained, take
another backup, and only then apply the contract migration:

```powershell
flask --app run:app db upgrade
flask --app run:app db current
```

Verify `0003_contract_memorial_secrets` is current and the old plaintext columns
are absent. If any step fails, stop; do not run a downgrade. Restore the verified
backup or fix forward under the incident procedure.

**Pass evidence:** backup/restore record, migration revision before and after,
row-count and sample-value checks, upload inventory with no missing rows, object
hash verification, and source-retention location.

## Gate 3 — Verify payment callback integrity in Safaricom sandbox

Configure sandbox consumer credentials and an externally reachable HTTPS callback
URL ending in `/api/payments/callback?token=<configured-token>`. Keep production
credentials and production callback URLs out of preview deployments. Run a test
payment and record the provider checkout ID, expected amount, receipt, callback
timestamp, and resulting transaction state.

Required scenarios:

1. Successful callback completes the matching transaction exactly once.
2. A byte-for-byte repeated callback returns success without a second side effect.
3. A changed payload for an already recorded checkout does not overwrite the first
   result and appears in reconciliation logs.
4. Missing/incorrect token is rejected; wrong amount, missing receipt, unknown
   checkout, and reused receipt never complete the payment.
5. Provider timeout/retry leaves a recoverable state and does not create a second
   payment transaction.
6. Receipt email failure does not reverse a confirmed payment and is visible to
   operators for follow-up.

Review `/api/admin/payment-reconciliation` with an authorized admin account and
compare every sandbox case against the provider's transaction record. Production
cutover requires the real callback URL and token to be configured in Safaricom
after the sandbox gate passes.

**Pass evidence:** sandbox transaction IDs and redacted callback logs, all six
scenario outcomes, reconciliation report, and provider callback delivery status.

## Gate 4 — Pass automated, browser, and security validation

The required pipeline is `.github/workflows/ci.yml`. Run the same checks locally
or require all PR checks to pass before release:

```powershell
python -m unittest discover -s backend/tests -v
python -m pip install -r backend/requirements.txt
python -m pip install pip-audit
pip-audit -r backend/requirements.txt
Set-Location frontend
npm ci
npm audit --audit-level=high
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
npm run e2e
```

In addition to the automated Chromium smoke tests, manually exercise current
Chrome, Safari, Edge, iOS Safari, and Android Chrome/WebView. Cover auth and OTP,
catalog/cart/checkout, upload and private image retrieval, payment success/failure,
keyboard-only navigation, cookie preferences, and mobile widths. Verify HTTPS,
CORS, HSTS, CSP behavior, security headers, 404 status behavior, and no secrets or
PII in browser/server logs. Validate staging migration rehearsal against a
production-like PostgreSQL engine; SQLite unit tests do not prove PostgreSQL
migration safety.

**Pass evidence:** green commit SHA for every CI job, staging migration rehearsal,
browser/device matrix, accessibility review, and documented accepted issues.

## Gate 5 — Roll out, monitor, and operate the service

1. Point the canonical domain at the production service, verify root and `www`
   behavior, HTTPS certificate renewal, HSTS, and one canonical redirect.
2. Verify `FRONTEND_URL`, `VITE_SITE_URL`, CORS origins, callback URL, sitemap
   host, and structured-data host all use the canonical origin. Rebuild after
   changing frontend build-time variables.
3. Deploy the expand revision using the Render pre-deploy migration pinned at
   `0002_hardened_data`. Confirm readiness, payment callbacks, signed media, email,
   and error rates before applying the contract revision in Gate 2.
4. Add `SENTRY_DSN` and the public `VITE_SENTRY_DSN` in the Render service
   configuration. Both SDKs are conditional on a configured DSN and scrub user,
   request, URL, breadcrumb, and exception-message data before sending. Confirm
   errors are captured without email, phone, memorial secrets, auth tokens, or
   payment credentials. Configure uptime checks for `/api/health/live` and
   `/api/health/ready`; page on readiness failures and elevated payment errors.
5. Assign an owner and daily schedule for payment reconciliation. Until an
   automated provider statement reconciliation job is implemented and proven,
   review `/api/admin/payment-reconciliation` against Safaricom records every day.
6. Enable daily database backups and test restore quarterly. Define object
   retention/versioning and recovery procedures. Review dependencies monthly and
   patch urgent security advisories immediately.
7. Monitor p75 Core Web Vitals and accessibility/customer support signals after
   launch. Roll back the application release if error rates or payment integrity
   regress; do not automatically roll back a destructive database migration.

**Pass evidence:** production DNS/TLS checks, release SHA and migration revision,
healthy dashboards and alert delivery, backup/restore evidence, named operational
owners, and payment reconciliation schedule.

## Current known completion boundary

The repository contains the application-side prerequisites and local automated
checks. The following cannot be marked complete from a code checkout: provisioning
cloud services and secrets, retrieving uploads from a live/retired runtime,
running migrations on staging/production data, executing Safaricom sandbox/live
payments, configuring DNS/Sentry/uptime alerts, and deploying the release. Treat
each as a blocking gate until its evidence above is recorded.
