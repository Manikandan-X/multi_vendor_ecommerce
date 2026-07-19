"""add processing to order status enum

Revision ID: aa7caea44366
Revises: c2956fed6de1
Create Date: 2026-07-19 22:03:59.661303

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aa7caea44366'
down_revision: Union[str, Sequence[str], None] = 'c2956fed6de1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.execute(
        "ALTER TYPE orderstatus ADD VALUE IF NOT EXISTS 'PROCESSING';"
    )


def downgrade():
    # PostgreSQL doesn't support removing enum values easily.
    pass
