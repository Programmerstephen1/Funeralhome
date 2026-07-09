# Environment Setup Guide

This guide covers how to set up the development environment on Windows, macOS, and Linux.

---

## Prerequisites

- **Node.js** (v16+) and npm: https://nodejs.org/
- **Python** (v3.8+): https://www.python.org/
- **Git**: https://git-scm.com/

---

## Windows Setup

### Frontend

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Backend

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env .env.local

# Edit .env.local with your secrets
# (Use Notepad or your preferred editor)

# Run the server
python run.py
```

The backend will be available at `http://localhost:5000`.

---

## macOS Setup

### Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env .env.local

# Edit .env.local with your secrets
nano .env.local

# Run the server
python run.py
```

The backend will be available at `http://localhost:5000`.

---

## Linux Setup

### Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (Python 3)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env .env.local

# Edit .env.local with your secrets
nano .env.local

# Run the server
python run.py
```

The backend will be available at `http://localhost:5000`.

---

## Environment Variables

### Frontend (.env.local)

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

### Backend (.env)

Create `backend/.env`:

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///backend.db
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_SHORTCODE=123456
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=https://startup-simulator-v2.onrender.com/api/payments/callback
MAIL_USE_TLS=true
MAIL_USE_SSL=false
```

---

## Docker Setup (Optional)

If you prefer to use Docker:

### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
    env_file:
      - ./backend/.env
    command: python run.py
```

Start with:
```bash
docker-compose up
```

---

## Verification

### Frontend

1. Open `http://localhost:5173` in your browser
2. You should see the last planner julz Funeral Home website

### Backend

1. Open `http://localhost:5000/api/health` in your browser
2. You should see: `{"status": "ok"}`

---

## Troubleshooting

### Frontend Issues

**Port 5173 already in use:**
```bash
npm run dev -- --port 5174
```

**Node modules issues:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Backend Issues

**Python not found:**
- Ensure Python 3.8+ is installed and in PATH
- On macOS/Linux, you may need to use `python3` instead of `python`

**Virtual environment not activating:**
```bash
# Windows (PowerShell)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

**Port 5000 already in use:**
```python
# Edit run.py and change port
app.run(host="0.0.0.0", port=5001, debug=True)
```

---

## Next Steps

1. Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
2. Check [API_DOCS.md](API_DOCS.md) for API endpoints
3. Start the frontend and backend servers
4. Test API connectivity via `http://localhost:5173`
