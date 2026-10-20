"""Drop plaintext memorial credentials after the hash-only code release is healthy.

Run this contract migration only after revision 0002 and after all old web
instances are drained. Render pre-deploy is intentionally pinned to 0002.
"""
from alembic import op
from sqlalchemy import inspect

revision = "0003_contract_memorial_secrets"
down_revision = "0002_hardened_data"
branch_labels = None
depends_on = None

def upgrade():
    columns = {column["name"] for column in inspect(op.get_bind()).get_columns("memorials")}
    legacy = [name for name in ("general_pin", "nuclear_pin", "security_answer") if name in columns]
    if legacy:
        with op.batch_alter_table("memorials") as batch:
            for name in legacy:
                batch.drop_column(name)

def downgrade():
    raise RuntimeError("Plaintext memorial credentials are intentionally not restored by downgrade.")
