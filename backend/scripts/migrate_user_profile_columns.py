"""Add profile fields used by /api/user/profile to an existing database.

Run from the repository root after configuring DATABASE_URL for the target
database: python backend/scripts/migrate_user_profile_columns.py
"""

from sqlalchemy import inspect, text

from backend.app import create_app, db


PROFILE_COLUMNS = {
    "first_name": "VARCHAR(80) NOT NULL DEFAULT ''",
    "last_name": "VARCHAR(80) NOT NULL DEFAULT ''",
    "phone": "VARCHAR(50)",
    "profile_picture": "TEXT",
}

app = create_app()

with app.app_context():
    engine = db.engine
    existing = {column["name"] for column in inspect(engine).get_columns("users")}
    missing = [(name, definition) for name, definition in PROFILE_COLUMNS.items() if name not in existing]

    if not missing:
        print("User profile columns already exist.")
    else:
        with engine.begin() as connection:
            for name, definition in missing:
                connection.execute(text(f"ALTER TABLE users ADD COLUMN {name} {definition}"))
                print(f"Added users.{name}")
