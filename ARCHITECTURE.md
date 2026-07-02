# Architecture Overview

## Project Structure

```
hollow-pine-funeral-home/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components (routed)
│   │   ├── services/           # API client and utilities
│   │   ├── App.jsx             # Main app shell
│   │   ├── index.jsx           # React entry point
│   │   └── styles.css          # Tailwind + custom theme
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                     # Flask API
│   ├── app/
│   │   ├── __init__.py         # Flask app factory
│   │   ├── models.py           # SQLAlchemy models
│   │   ├── routes.py           # API endpoints
│   │   └── mpesa.py            # MPesa integration stub
│   ├── run.py                  # Entry point
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Secrets (not committed)
│
├── .gitignore
├── README.md                   # Project setup guide
└── ARCHITECTURE.md            # This file
```

## Frontend Architecture

### Tech Stack
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.0
- **Styling**: Tailwind CSS 3.4.4 + custom theme tokens
- **Routing**: Hash-based routing in `App.jsx`

### Key Components
- **App.jsx**: Main shell with sticky navigation and hash routing
- **Pages**: `HomePage`, `ObituaryListPage`, `PlanAheadPage`, `TributePage`, `WriteEulogyPage`
- **Reusable Components**: `Button`, `Card`, `Modal`, `LoadingSpinner`
- **API Service**: `services/api.js` for centralized backend communication

### Design System
- **Color Palette**:
  - Primary: `#A8895C` (bronze)
  - Text Dark: `#1F2E27` (forest green)
  - Background: `#F8F6F0` (cream)
  - Borders: `#E8DFD1` (light tan)
  - Accent: `#3D3530` (dark brown)

- **Typography**:
  - Serif (headings): Fraunces
  - Sans-serif (body): Inter

### Layout System
- `.site-shell`: Root container with global styles
- `.site-container`: Content wrapper with max-width and horizontal padding
- `.page-section`: Major section with vertical spacing and borders

## Backend Architecture

### Tech Stack
- **Framework**: Flask 2.4.3
- **Database**: SQLAlchemy 2.0.35 (SQLite for development)
- **CORS**: Flask-CORS 4.0.0
- **Environment**: python-dotenv 1.0.0
- **HTTP**: requests 2.32.0

### Key Modules
- **app/__init__.py**: Flask app factory, database initialization
- **app/models.py**: SQLAlchemy ORM models (`FuneralService`, `Tribute`)
- **app/routes.py**: REST API endpoints with blueprints
- **app/mpesa.py**: MPesa payment integration (stub)
- **run.py**: Entry point for development server

### API Endpoints
- `GET /api/health` - Health check
- `GET /api/services` - List funeral services
- `GET /api/tributes` - Fetch all tributes
- `POST /api/tributes` - Create a new tribute
- `POST /api/payments/stkpush` - Initiate MPesa STK push

### Database
- **Development**: SQLite (`backend.db`)
- **Production**: PostgreSQL (configure via `DATABASE_URL` in `.env`)
- **Models**: Auto-created on app startup via `db.create_all()`

## Communication Flow

```
React Frontend
    ↓
fetch() → services/api.js
    ↓
HTTP Request (CORS enabled)
    ↓
Flask Backend (port 5000)
    ↓
app/routes.py
    ↓
SQLAlchemy Models ↔ SQLite
    ↓
JSON Response
```

## Environment Configuration

### Frontend
- `VITE_API_URL`: Backend API base URL (default: `http://localhost:5000`)

### Backend
- `SECRET_KEY`: Flask secret for sessions
- `DATABASE_URL`: Database connection string
- `MPESA_CONSUMER_KEY`: M-Pesa API key
- `MPESA_CONSUMER_SECRET`: M-Pesa API secret
- `MPESA_SHORTCODE`: M-Pesa business code
- `MPESA_PASSKEY`: M-Pesa passkey

## Development Workflow

1. **Frontend**: `cd frontend && npm run dev` (Vite dev server on port 5173)
2. **Backend**: `cd backend && python run.py` (Flask dev server on port 5000)
3. **API Calls**: Frontend calls `http://localhost:5000/api/*` endpoints
4. **Database**: SQLite auto-initializes on first run

## Deployment Considerations

- **Frontend**: Build with `npm run build` → deploy to static hosting (Vercel, Netlify)
- **Backend**: Use Gunicorn/Waitress in production; set `DEBUG=false`
- **Database**: Use PostgreSQL in production
- **Secrets**: Use environment variables or managed secret stores (never commit `.env`)
- **CORS**: Update `CORS(app)` to allow specific frontend domain in production

## Future Enhancements

1. Add JWT authentication
2. Implement full MPesa integration
3. Add email notifications (obituary alerts)
4. Create admin dashboard for content management
5. Add image upload for obituaries and tributes
6. Implement real-time updates with WebSockets
