Deployment notes — configuring the frontend to reach the backend
=============================================================

Problem
-------
When the frontend UI is deployed to HTTPS (for example `https://funeralhome-5inb.onrender.com`), any requests to a backend at `http://127.0.0.1:5000` or another HTTP-only host will fail with network/mixed-content or DNS errors. The frontend needs to know the public HTTPS URL of the backend.

Quick solution
--------------
Set the environment variable `VITE_API_URL` in your frontend host to the full backend HTTPS origin, for example:

`https://your-backend.onrender.com`

Then rebuild/redeploy the frontend so Vite injects the value at build time.

Render (example)
----------------
1. Open your Render dashboard and select the frontend service.
2. Go to the "Environment" section (Environment Variables).
3. Add a new variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend.onrender.com` (replace with your backend URL)
4. Save and trigger a redeploy (click "Manual Deploy" or push a commit to your repo).

Vercel
------
1. In your Vercel project, go to "Settings" → "Environment Variables".
2. Add `VITE_API_URL` for the Production environment and set its value.
3. Redeploy the site.

Netlify
-------
1. Site Settings → Build & deploy → Environment → Environment variables.
2. Add `VITE_API_URL` and set its value.
3. Redeploy the site.

Notes
-----
- `VITE_` prefixed variables are embedded at build-time by Vite — changing them requires rebuilding the frontend.
- Make sure the backend URL is HTTPS and publicly reachable; the frontend will fail with "Failed to fetch" or mixed-content errors if it is not.
- If your backend uses a different hostname for API requests, ensure CORS is configured to allow the frontend origin. The backend already permits some origins in `backend/app/routes.py`.

If you want, I can prepare the exact value to set for `VITE_API_URL` if you share the backend's public URL, or I can attempt to discover it if you host the backend on Render and can give me the Render service name.

Fallback / Mock payments
------------------------
If M-Pesa processing is not available in your deployment, you can enable a mock payment provider during the frontend build so users can complete bookings for testing:

- Frontend environment variable: `VITE_PAYMENT_PROVIDER=mock`
- Backend: no change required; a lightweight `/api/payments/mock` endpoint has been added to accept mock payments.

Set `VITE_PAYMENT_PROVIDER=mock` in your frontend host environment and redeploy the frontend (Vite injects the value at build time). This will route M-Pesa payment attempts to the mock endpoint which returns an immediate success.

Quick test scripts
------------------
Two tiny scripts are included in the repository to help validate a deployed backend. They take the backend origin as the first argument.

Usage (Unix / WSL / macOS):

```bash
./scripts/check_api.sh https://your-backend.example.com
```

Usage (PowerShell / Windows):

```powershell
.\scripts\check_api.ps1 -ApiBase "https://your-backend.example.com"
```

What they do
------------
- Call `GET {apiBase}/api/health` and print status.
- Send a sample `POST {apiBase}/api/consultations` with mock data and print the response.

If you paste the `apiBase` here, I can run the check for you and interpret the results.
