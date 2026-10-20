"""Create the application's initial schema (safe for legacy create_all databases).

Revision ID: 0001_schema_baseline
"""
from alembic import op
from flask import current_app

revision = "0001_schema_baseline"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # This one-time baseline intentionally uses checkfirst: older deployments used
    # db.create_all(), so existing tables are retained and the next revision evolves
    # their data/schema. Later revisions contain explicit operations only.
    from app import db
    from app import models  # register every model on the migration metadata
    db.metadata.create_all(bind=op.get_bind(), checkfirst=True)

def downgrade():
    raise RuntimeError("The initial schema baseline is not reversible; restore a database backup instead.")
