Running tests locally

Backend (Python / pytest):

1. Create a virtual environment and activate it:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # PowerShell
```

2. Install dependencies:

```powershell
pip install --upgrade pip
pip install -r backend/requirements.txt
```

3. (Optional) Apply lightweight schema updates used by tests:

```powershell
python backend/scripts/update_schema.py
```

4. Run the tests:

```powershell
pytest backend/tests -q
```

Frontend (Node / vitest):

1. Install dependencies and run tests:

```powershell
cd frontend
npm ci
npm test
```

CI notes

- A GitHub Actions workflow is added at `.github/workflows/ci.yml` that runs backend pytest and frontend `npm test` on push/pull requests.
- If tests fail due to environment-specific services (email, external APIs), set `MAIL_SUPPRESS_SEND` or mock external services in tests.

If you'd like, I can add caching to the CI workflow, or make the CI run only a subset of tests in PRs. Let me know which option you prefer.