"""Add profile columns omitted by the original create_all-based schema.

Revision ID: 0004_user_profile_columns
Revises: 0003_contract_memorial_secrets

Existing databases created before the User profile fields were introduced can
otherwise fail every ORM query for a user (including login) with a missing
column error. This migration is additive and safe for existing user rows.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "0004_user_profile_columns"
down_revision = "0003_contract_memorial_secrets"
branch_labels = None
depends_on = None


def upgrade():
    inspector = inspect(op.get_bind())
    if "users" not in inspector.get_table_names():
        return

    existing = {column["name"] for column in inspector.get_columns("users")}
    additions = (
        sa.Column("first_name", sa.String(length=80), nullable=False, server_default=""),
        sa.Column("last_name", sa.String(length=80), nullable=False, server_default=""),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("profile_picture", sa.Text(), nullable=True),
    )
    for column in additions:
        if column.name not in existing:
            with op.batch_alter_table("users") as batch:
                batch.add_column(column)


def downgrade():
    raise RuntimeError("User profile data must not be removed by an automatic downgrade.")
