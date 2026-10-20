"""Apply Alembic migrations and optionally seed non-production demo services.

Usage (from the repository root):
    python backend/init_db.py [--seed]

Destructive schema resets are intentionally not supported by this utility.
"""
import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app import create_app, migrate


def main():
    parser = argparse.ArgumentParser(description="Manage the database using Alembic migrations.")
    parser.add_argument("--seed", action="store_true", help="Seed sample funeral services after migration (development only).")
    parser.add_argument("--reset", action="store_true", help="Deprecated. Use a disposable test database; this command never deletes data.")
    args = parser.parse_args()
    if args.reset:
        raise SystemExit("Database reset is disabled. Restore a deliberate backup or use an isolated disposable database.")
    if migrate is None:
        raise SystemExit("Install backend/requirements.txt to enable Flask-Migrate.")
    if args.seed and os.environ.get("APP_ENV", "development").lower() == "production":
        raise SystemExit("Demo seed data is disabled in production.")

    app = create_app()
    with app.app_context():
        from flask_migrate import upgrade
        from app import db
        upgrade(directory=str(Path(__file__).parent / "migrations"))
        if args.seed:
            from app.models import FuneralService
            examples = [
                ("Funeral Planning", "Assistance with arrangements, venues, and vendor coordination."),
                ("Obituary Writing", "Professional obituary composition and editing."),
                ("Memorial Tributes", "Online tribute pages with guestbooks and galleries."),
            ]
            for name, description in examples:
                if not FuneralService.query.filter_by(name=name).first():
                    db.session.add(FuneralService(name=name, description=description))
            db.session.commit()
    print("Database migrations are current.")


if __name__ == "__main__":
    main()
