"""merge migration heads

Revision ID: 550b9df0a10c
Revises: 20260926_0007, 20260927_0004
Create Date: 2026-09-27 18:38:03.257839
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '550b9df0a10c'
down_revision: str | None = ('20260926_0007', '20260927_0004')
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
