"""
Initial migration: Create knowledge base tables

Revision ID: 001_initial
Revises: 
Create Date: 2025-11-27 14:30:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Use existing enum types (created by init-db.sql)
    # create_type=False tells SQLAlchemy not to create the type
    difficulty_enum = postgresql.ENUM(
        'beginner', 'intermediate', 'advanced',
        name='difficultylevel',
        create_type=False
    )
    focus_area_enum = postgresql.ENUM(
        'technique', 'physical', 'mental', 'tactical',
        name='focusarea',
        create_type=False
    )
    
    # Create videos table
    op.create_table(
        'videos',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('storage_path', sa.String(512), nullable=False),
        sa.Column('thumbnail_url', sa.String(512), nullable=True),
        sa.Column('duration', sa.Integer, nullable=True),
        sa.Column('size_bytes', sa.BigInteger, nullable=False),
        sa.Column('format', sa.String(10), nullable=False),
        sa.Column('extra_metadata', postgresql.JSONB, nullable=True),
        sa.Column('uploaded_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column('deleted_at', sa.DateTime, nullable=True),
    )
    
    # Create drills table
    op.create_table(
        'drills',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('title', sa.String(200), nullable=False, index=True),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('difficulty', difficulty_enum, nullable=False, index=True),
        sa.Column('focus_area', focus_area_enum, nullable=False, index=True),
        sa.Column('equipment', postgresql.ARRAY(sa.String), nullable=True),
        sa.Column('extra_metadata', postgresql.JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now(), index=True),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('deleted_at', sa.DateTime, nullable=True),
    )
    
    # Create exercises table
    op.create_table(
        'exercises',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('title', sa.String(200), nullable=False, index=True),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('difficulty', difficulty_enum, nullable=False, index=True),
        sa.Column('focus_area', focus_area_enum, nullable=False, index=True),
        sa.Column('equipment', postgresql.ARRAY(sa.String), nullable=True),
        sa.Column('extra_metadata', postgresql.JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now(), index=True),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('deleted_at', sa.DateTime, nullable=True),
    )
    
    # Create tips table
    op.create_table(
        'tips',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('title', sa.String(200), nullable=False, index=True),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('category', sa.String(100), nullable=True, index=True),
        sa.Column('focus_area', focus_area_enum, nullable=False, index=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now(), index=True),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('deleted_at', sa.DateTime, nullable=True),
    )
    
    # Create training_programs table
    op.create_table(
        'training_programs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('title', sa.String(200), nullable=False, index=True),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('duration_weeks', sa.Integer, nullable=False),
        sa.Column('difficulty', difficulty_enum, nullable=False, index=True),
        sa.Column('program_data', postgresql.JSONB, nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now(), index=True),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('deleted_at', sa.DateTime, nullable=True),
    )
    
    # Create junction tables
    op.create_table(
        'drill_videos',
        sa.Column('drill_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('drills.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('video_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('videos.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('order', sa.Integer, default=0),
    )
    
    op.create_table(
        'exercise_videos',
        sa.Column('exercise_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('exercises.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('video_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('videos.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('order', sa.Integer, default=0),
    )
    
    op.create_table(
        'tip_videos',
        sa.Column('tip_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tips.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('video_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('videos.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('order', sa.Integer, default=0),
    )
    
    op.create_table(
        'program_videos',
        sa.Column('program_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('training_programs.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('video_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('videos.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('order', sa.Integer, default=0),
    )


def downgrade() -> None:
    # Drop junction tables
    op.drop_table('program_videos')
    op.drop_table('tip_videos')
    op.drop_table('exercise_videos')
    op.drop_table('drill_videos')
    
    # Drop main tables
    op.drop_table('training_programs')
    op.drop_table('tips')
    op.drop_table('exercises')
    op.drop_table('drills')
    op.drop_table('videos')
    
    # Drop enum types
    op.execute('DROP TYPE IF EXISTS focusarea')
    op.execute('DROP TYPE IF EXISTS difficultylevel')
