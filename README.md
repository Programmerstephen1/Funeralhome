# Last Planner Julz Funeral Planning Hub

A funeral planning website with a React/Vite frontend and a Python/Flask API.

## Repository layout

- `frontend/` - React application, Vite build, Tailwind CSS, and browser routes.
- `backend/` - Flask API, SQLAlchemy models, authentication, payments, uploads, and PDF generation.
- `Dockerfile` - builds the Vite app and serves it with the Flask/Gunicorn container.
- `render.yaml` - Render web service configuration. The container serves the frontend and API from one origin by default.
- `docs/production-go-live.md` - Five release gates for cloud services, data migration, M-Pesa, QA, and operations.

## Local setup

Use Node.js 24 and Python 3.12 to match the container and CI runtimes.

### Frontend

```powershell
cd frontend
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Vite listens on port `4173`. `VITE_API_URL` defaults to `http://localhost:5000` in the example file.

### Backend

In a second terminal:

```powershell
cd backend
Copy-Item .env.example .env
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python run.py
```

The local API listens on `0.0.0.0:5000` and uses SQLite unless `DATABASE_URL` is set. Create distinct random `SECRET_KEY` and `JWT_SECRET_KEY` values for any shared or production-like environment. The example values are placeholders.

### Test from a phone on the same Wi-Fi

1. Find the development computer's LAN IPv4 address.
2. In `backend/.env`, set `FRONTEND_URL` to `http://<computer-ip>:4173` and add that exact origin to `CORS_ALLOWED_ORIGINS`.
3. Leave `VITE_API_URL=http://localhost:5000`; the browser client substitutes the page's LAN hostname for localhost, keeping port 5000.
4. Start Vite and Flask, allow ports 4173 and 5000 through the private-network firewall, then open `http://<computer-ip>:4173` on the phone.

Do not expose development servers to the public internet. Public QR codes and provider callbacks must use the deployed HTTPS domain, never a LAN address.

## Email, OAuth, and M-Pesa

- Configure `MAIL_*` values for email verification and password reset. Gmail requires an app password. Keep credentials in local env files or the hosting secret manager.
- OAuth client IDs are set through the public `VITE_GOOGLE_CLIENT_ID`, `VITE_FACEBOOK_APP_ID`, and `VITE_TWITTER_CLIENT_ID` build variables. These IDs are visible to browsers; do not put private secrets in `VITE_*` variables.
- M-Pesa checkout requires provider credentials, a public HTTPS `MPESA_CALLBACK_URL` ending in `/api/payments/callback`, and a strong `MPESA_CALLBACK_TOKEN`. Validate all payment flows in the provider sandbox before enabling live transactions.
- Email codes are single-use and expire after 10 minutes. Database profile changes may require the existing migration script; take a backup and verify the target `DATABASE_URL` before running migrations.

## Deployment

The supported production topology is one same-origin Render Docker web service. The Docker image builds and serves the frontend and Flask API from one origin. `VITE_API_URL` is empty in production so the browser calls its current origin. `VITE_SITE_URL` and backend `FRONTEND_URL` must match the canonical public origin. The Render service uses `https://funeralhome-api.onrender.com` until a custom domain is configured. Do not deploy a second frontend Static Site unless all frontend/API origins and deployment documentation are deliberately changed together.

The frontend includes `sitemap.xml`, `robots.txt`, `llms.txt`, LocalBusiness JSON-LD, route-aware titles/descriptions/canonicals, and a cookie-preference banner for the same-origin Render host. Update `VITE_SITE_URL`, these public files, and the JSON-LD in `frontend/index.html` together when the canonical domain or verified business details change. Route metadata is updated client-side; reliable route-specific social previews still require prerender/SSR.

Set `DATABASE_URL`, stable signing secrets, `REDIS_URL`, SMTP credentials, OAuth client IDs at frontend build time, and M-Pesa production credentials in the host configuration. `REDIS_URL` is mandatory in production for shared rate limits. Rebuild the image after changing `VITE_*` values. Use managed PostgreSQL and durable object storage before relying on multiple instances. `/api/health` and `/api/health/ready` check database readiness; `/api/health/live` checks process liveness.

Security headers include a report-only Content Security Policy while third-party integrations are reviewed. Review CSP violations in browser developer tools before switching `CSP_REPORT_ONLY` off; no CSP report collector is configured yet. Render enables HSTS because its public endpoint is HTTPS. Keep production CORS restricted to the deployed frontend origin.

Memorial pages and gallery content currently stay in the browser and do not sync to relatives' devices or receive server backups. The UI discloses this limitation; do not treat that data as a durable memorial record. Upload requests are capped at 10 MiB overall; a single image is limited to 8 MiB and 25 megapixels by default. Uploaded images are stored in a private S3-compatible bucket and served through short-lived signed URLs. Existing production uploads must be copied from their source runtime before that runtime is replaced.

## Quality checks

```powershell
cd frontend
npm test
npm run build
```

```powershell
python -m unittest discover -s backend/tests -v
```

GitHub Actions runs Python 3.12 backend unit tests and dependency auditing, Node 24 frontend lint/format/type checks, npm dependency auditing, frontend unit tests and production build, and a Chromium Playwright smoke test on pull requests and pushes to `main`. The browser job starts an isolated Flask/Vite pair with test-only values; it does not use production credentials or deploy previews.
# Production data services and release sequence

The backend uses PostgreSQL, Render Key Value (Redis), and a private S3-compatible
bucket (AWS S3 or Cloudflare R2). Production startup deliberately fails closed if
`DATABASE_URL`, `REDIS_URL`, object-store credentials, or `MPESA_CALLBACK_TOKEN`
are missing. Set bucket access to private/block-public-access; configure lifecycle
and retention policies in the provider console. Do not put service credentials in
the repository or frontend `VITE_*` variables.

## One-time migration / deployment sequence

1. Back up PostgreSQL and verify restore access. Export the current local uploads
   directory and retain it until object migration is verified. If any old uploads
   exist only on the currently running/retired container, retrieve them from that
   exact runtime before replacing it; a fresh image or this workstation's folder
   is not evidence that the production container's ephemeral files were copied.
2. Provision the private bucket and create a least-privilege service account that
   can read, write, and delete objects only in that bucket. Add these Render
   secrets: `OBJECT_STORAGE_BUCKET`, `OBJECT_STORAGE_ENDPOINT` (blank for AWS),
   `OBJECT_STORAGE_REGION`, `OBJECT_STORAGE_ACCESS_KEY`, and
   `OBJECT_STORAGE_SECRET_KEY`. Set `OBJECT_STORAGE_SSE=AES256` for AWS S3 when
   bucket default encryption is not enforced; leave it empty for R2, which handles
   encryption at rest at the service layer. Render Blueprint provisions Redis and
   injects its internal `REDIS_URL`; verify both services share the Oregon region.
3. With a copied/staging database, configure the same environment and run:

   ```powershell
   cd backend
   flask --app run:app db upgrade 0002_hardened_data
   ```

   This baseline safely adopts the legacy `create_all()` schema, adds storage and
   callback fields, converts monetary columns to `NUMERIC(12,2)`, and hashes
   existing Memorial PINs/security answers. `0003_contract_memorial_secrets`
   intentionally remains pending during this release so old app instances can
   drain before plaintext legacy columns are removed.
4. Migrate legacy uploaded files, first as a read-only inventory and then with
   `--apply`. Run with working directory `backend`, against the selected database:

   ```powershell
   python -m scripts.migrate_uploads_to_object_storage --dry-run
   python -m scripts.migrate_uploads_to_object_storage --apply
   ```

   The script is resumable, verifies stored byte lengths, and never deletes source
   files. Keep the source backup until sample images have been opened through the
   app's signed-media route and all known keys have verified.
5. Set `MPESA_CALLBACK_TOKEN` to a long random secret, update Safaricom's callback
   URL to the public HTTPS endpoint, and run one sandbox transaction. Callback
   success is persisted once per checkout ID; mismatched amount, missing receipt,
   unknown transaction, conflicting retry, or reused receipt is recorded for
   reconciliation and cannot mark a payment complete.
6. Deploy the expand release. Render's pre-deploy command upgrades only through
   `0002_hardened_data`; readiness checks PostgreSQL and Redis. Confirm all new
   instances are healthy, image reads work, and payment callbacks reconcile.
7. After old instances are drained and the new hash-only code is serving, take a
   fresh backup and run `cd backend && flask --app run:app db upgrade` to apply
   `0003_contract_memorial_secrets`. Verify no plaintext credential columns remain.
8. Establish a daily review of the authenticated `/api/admin/payment-reconciliation`
   report. It returns callback exceptions and transactions left pending for more
   than 24 hours. Resolve each against the Safaricom statement/provider records;
   do not manually mark a payment complete without matching checkout, receipt,
   and amount. Retain migration logs/backups per the business retention policy.

The full frontend dependency tree is audited in CI (`npm audit --audit-level=high`).
The image build now uses Node 24, Vite 8, React Router 7, and Tailwind 4 to resolve
the previously reported development dependency advisories. Keep frontend and
backend lock/dependency manifests in their respective directories.
