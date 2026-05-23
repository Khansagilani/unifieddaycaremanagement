"""initial_schema

Revision ID: 12a6c88a1d94
Revises:
Create Date: 2026-05-23 13:56:12.719218

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '12a6c88a1d94'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Use raw SQL with IF EXISTS / DO NOTHING guards so this is safe
    # regardless of what state the production DB is in.
    op.execute("ALTER TABLE children DROP CONSTRAINT IF EXISTS children_registration_number_key")
    op.execute("ALTER TABLE children ALTER COLUMN registration_number TYPE VARCHAR(100)")
    op.execute("ALTER TABLE authorized_pickups DROP COLUMN IF EXISTS relationship")
    op.execute("ALTER TABLE emergency_contacts DROP COLUMN IF EXISTS relationship")
    op.execute("ALTER TABLE parent_child ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING'")
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name='parent_child' AND column_name='status'
                AND character_maximum_length = 20
            ) THEN
                ALTER TABLE parent_child ALTER COLUMN status TYPE VARCHAR(50);
            END IF;
        END$$
    """)


def downgrade() -> None:
    op.execute("ALTER TABLE parent_child ALTER COLUMN status TYPE VARCHAR(20)")
    op.execute("ALTER TABLE authorized_pickups ADD COLUMN IF NOT EXISTS relationship VARCHAR(100)")
    op.execute("ALTER TABLE emergency_contacts ADD COLUMN IF NOT EXISTS relationship VARCHAR(100)")
    op.execute("ALTER TABLE children ALTER COLUMN registration_number TYPE VARCHAR(20)")
