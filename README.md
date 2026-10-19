# last palnner julz

A professional funeral home website with a React frontend and a Python Flask backend.

## Structure

- `frontend/` - React application powered by Vite and Tailwind CSS.
- `backend/` - Flask API with SQLAlchemy models and MPesa integration logic.

## Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### Account registration and email codes

- Copy `backend/.env.example` to `backend/.env` and set a real SMTP sender address and password. For Gmail, use an app password; do not put your normal account password in the file. Keep `.env` private.
- Copy `frontend/.env.example` to `frontend/.env.local`. Keep `VITE_API_URL=http://localhost:5000` for local development.
- Restart both development servers after changing environment values. The API returns a clear delivery error when SMTP is missing or cannot send, rather than claiming that a code was sent.
- For production, set `VITE_API_URL` to the deployed Flask API origin in the frontend host, and set `FRONTEND_URL` plus the `MAIL_*` values in the API host. Rebuild the frontend after changing `VITE_API_URL` because Vite embeds it at build time.
- The root `render.yaml` and `Dockerfile` define a Render Flask API service named `funeralhome-api`; the frontend production build uses `https://funeralhome-api.onrender.com`. Deploy the Blueprint from the repository root, provide the existing production `DATABASE_URL` and SMTP values when Render prompts, then rebuild the existing frontend Static Site so it includes `frontend/.env.production`. The health route checks database connectivity and returns HTTP 503 if the database is unavailable.
- Email codes are single-use, expire after 10 minutes, and are tied to either email verification or password reset. The database creates the `auth_challenges` table on app startup; older verification codes must be resent after deploying this change.

## Notes

- Keep `.env` files private and out of version control. The backend needs stable `SECRET_KEY` and `JWT_SECRET_KEY` values in production; it intentionally refuses to start in production without them.
- Existing databases need the new account-profile columns once: set `DATABASE_URL` for the intended database, then run `python backend/scripts/migrate_user_profile_columns.py` from the repository root before deploying the profile update.
- Set `MPESA_CALLBACK_URL` to this app's public HTTPS callback endpoint (`/api/payments/callback`) and set a long random `MPESA_CALLBACK_TOKEN`. M-Pesa checkout remains unavailable until both are configured. Configure the Daraja credentials and production endpoints separately before accepting live payments.
- `FRONTEND_URL` should match the deployed frontend origin when the frontend and API are hosted separately. `VITE_API_URL` is optional when Flask serves the frontend and API from the same origin.
- Memorial pages and photo galleries currently store their content in the browser only. They do not sync to other devices or have server backups; the interface now says so before users add personal content.
- The image upload API requires a signed-in user, accepts valid JPEG, PNG, or WebP images up to 10 MB, and re-encodes them before storing.
