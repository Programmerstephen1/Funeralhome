"""Expand legacy rows to fixed precision, hashed memorial secrets and callback audit.

Revision ID: 0002_hardened_data
Revises: 0001_schema_baseline
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect, text
from werkzeug.security import generate_password_hash

revision = "0002_hardened_data"
down_revision = "0001_schema_baseline"
branch_labels = None
depends_on = None

def _columns(table):
    return {column["name"] for column in inspect(op.get_bind()).get_columns(table)}

def _tables():
    return set(inspect(op.get_bind()).get_table_names())

def _add(table, column):
    if column.name not in _columns(table):
        with op.batch_alter_table(table) as batch:
            batch.add_column(column)

def upgrade():
    tables = _tables()
    # Additive fields consumed by current login/profile ORM queries. Older
    # create_all deployments can have a users table without these columns;
    # apply them during the expand release before the new app starts serving.
    if "users" in tables:
        for column in (
            sa.Column("first_name", sa.String(80), nullable=False, server_default=""),
            sa.Column("last_name", sa.String(80), nullable=False, server_default=""),
            sa.Column("phone", sa.String(50), nullable=True),
            sa.Column("profile_picture", sa.Text(), nullable=True),
        ):
            _add("users", column)

    if "uploaded_files" in tables:
        _add("uploaded_files", sa.Column("content_type", sa.String(100), nullable=False, server_default="image/jpeg"))
        _add("uploaded_files", sa.Column("byte_size", sa.Integer(), nullable=False, server_default="0"))

    if "memorials" in tables:
        columns = _columns("memorials")
        if "general_pin_hash" not in columns:
            _add("memorials", sa.Column("general_pin_hash", sa.String(255), nullable=True))
        if "nuclear_pin_hash" not in columns:
            _add("memorials", sa.Column("nuclear_pin_hash", sa.String(255), nullable=True))
        if "security_answer_hash" not in columns:
            _add("memorials", sa.Column("security_answer_hash", sa.String(255), nullable=True))
        columns = _columns("memorials")
        legacy = [name for name in ("general_pin", "nuclear_pin", "security_answer") if name in columns]
        if legacy:
            connection = op.get_bind()
            selected = [name if name in columns else "'' AS " + name for name in ("general_pin", "nuclear_pin", "security_answer")]
            rows = connection.execute(text("SELECT id, " + ", ".join(selected) + " FROM memorials")).mappings().all()
            for row in rows:
                connection.execute(text("UPDATE memorials SET general_pin_hash=:g, nuclear_pin_hash=:n, security_answer_hash=:a WHERE id=:id"), {
                    "g": generate_password_hash(str(row["general_pin"])),
                    "n": generate_password_hash(str(row["nuclear_pin"])),
                    "a": generate_password_hash(str(row["security_answer"]).strip().lower()),
                    "id": row["id"],
                })
            with op.batch_alter_table("memorials") as batch:
                batch.alter_column("general_pin_hash", existing_type=sa.String(255), nullable=False)
                batch.alter_column("nuclear_pin_hash", existing_type=sa.String(255), nullable=False)
                batch.alter_column("security_answer_hash", existing_type=sa.String(255), nullable=False)

    # Existing float columns are deliberately retained by name and converted to
    # NUMERIC(12,2), preserving API semantics while eliminating binary float math.
    for table, column in (("products", "price"), ("orders", "total_amount"), ("payment_transactions", "amount")):
        if table not in tables or column not in _columns(table):
            continue
        kind = next(c["type"] for c in inspect(op.get_bind()).get_columns(table) if c["name"] == column)
        if isinstance(kind, sa.Float):
            with op.batch_alter_table(table) as batch:
                batch.alter_column(column, existing_type=kind, type_=sa.Numeric(12, 2), nullable=(column == "amount"))

    if "payment_transactions" in tables:
        _add("payment_transactions", sa.Column("mpesa_receipt", sa.String(50), nullable=True))
        _add("payment_transactions", sa.Column("callback_received_at", sa.DateTime(), nullable=True))
        indexes = inspect(op.get_bind()).get_indexes("payment_transactions")
        constraints = inspect(op.get_bind()).get_unique_constraints("payment_transactions")
        has_receipt_unique = any(index.get("unique") and index.get("column_names") == ["mpesa_receipt"] for index in indexes) or any(constraint.get("column_names") == ["mpesa_receipt"] for constraint in constraints)
        if not has_receipt_unique:
            op.create_index("uq_payment_transactions_mpesa_receipt", "payment_transactions", ["mpesa_receipt"], unique=True)

    if "mpesa_callback_events" not in tables:
        op.create_table(
            "mpesa_callback_events",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("checkout_request_id", sa.String(128), nullable=False, unique=True),
            sa.Column("payload_sha256", sa.String(64), nullable=False),
            sa.Column("result_code", sa.Integer(), nullable=False),
            sa.Column("received_at", sa.DateTime(), nullable=False),
            sa.Column("processed_at", sa.DateTime(), nullable=True),
            sa.Column("error", sa.String(255), nullable=True),
        )
        op.create_index("ix_mpesa_callback_events_checkout_request_id", "mpesa_callback_events", ["checkout_request_id"])

def downgrade():
    raise RuntimeError("Security/data migrations cannot be safely reversed; restore a verified backup.")
