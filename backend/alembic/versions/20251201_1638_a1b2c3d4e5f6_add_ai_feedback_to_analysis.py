"""add ai_feedback to analysis

Revision ID: a1b2c3d4e5f6
Revises: 79a9948f4426
Create Date: 2025-12-01 16:38:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '79a9948f4426'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('analyses', sa.Column('ai_feedback', postgresql.JSONB(astext_type=sa.Text()), nullable=True))


def downgrade() -> None:
    op.drop_column('analyses', 'ai_feedback')
