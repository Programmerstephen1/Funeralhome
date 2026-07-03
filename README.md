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

## Notes

- `backend/.env` contains local secrets and should not be committed.
- `frontend/src/services/` is a starting point for backend API calls.
