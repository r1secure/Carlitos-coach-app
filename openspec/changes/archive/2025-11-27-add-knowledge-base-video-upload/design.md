# Design Document: Knowledge Base and Video Upload System

## Context

Carlitos v3 requires a foundational content management system to store tennis coaching resources (drills, exercises, tips, training programs) with associated reference videos. This content will be used for:
- Providing personalized recommendations to players based on their biomechanical analysis
- Offering a searchable library for coaches and players
- Comparing user technique against professional reference videos

**Constraints:**
- MVP supports 2-3 concurrent users
- 1GB storage quota per user
- Local development with Docker Compose
- Production deployment on self-hosted infrastructure with Traefik reverse proxy

**Stakeholders:**
- Admins: Create and manage knowledge base content
- Coaches: Browse and recommend content to players
- Players: Browse and access recommended content

## Goals / Non-Goals

### Goals
- ✅ Store and manage four content types: Drills, Exercises, Tips, Training Programs
- ✅ Upload and store reference videos (admin only) with MinIO S3-compatible storage
- ✅ Full-text search and filtering by category, difficulty, focus area
- ✅ Secure video access with expiring signed URLs
- ✅ Automatic video validation (format, size, resolution)

### Non-Goals
- ❌ User video upload for analysis (separate capability, future change)
- ❌ Video transcoding/compression (use original format, add if performance issues arise)
- ❌ Real-time collaborative editing of knowledge base content
- ❌ Version control for content changes (soft delete only)
- ❌ Public access (all content requires authentication)

## Decisions

### Decision 1: Content Type Modeling

**What:** Store Drills, Exercises, Tips, and Training Programs as separate database tables with similar schemas.

**Why:**
- Each type has distinct metadata requirements (e.g., drills have equipment, programs have duration_weeks)
- Allows type-specific validation and business logic
- Easier to query and filter by type
- Future extensibility (e.g., adding "Matches" or "Tactics" types)

**Alternatives considered:**
- Single `content` table with polymorphic type field → Rejected: Complex queries, harder to maintain type-specific fields
- JSONB-only storage → Rejected: Loses relational integrity, harder to index and search

### Decision 2: Video Storage with MinIO

**What:** Use MinIO (S3-compatible) for video storage instead of PostgreSQL BYTEA or filesystem.

**Why:**
- Scalable: Easy to migrate to AWS S3 or other cloud storage later
- Separation of concerns: Database for metadata, object storage for blobs
- Built-in access control with signed URLs
- Docker-friendly for local development

**Alternatives considered:**
- PostgreSQL BYTEA → Rejected: Database bloat, poor performance for large files
- Local filesystem → Rejected: Hard to scale, no built-in access control
- Direct cloud storage (AWS S3) → Deferred: Start with MinIO for cost control, migrate later if needed

### Decision 3: Search Implementation

**What:** Use PostgreSQL full-text search with `pg_trgm` extension for fuzzy matching.

**Why:**
- No additional infrastructure (Elasticsearch, Algolia)
- Good enough for MVP (hundreds of items, not millions)
- Supports French language (user-facing content is in French)
- Trigram similarity for typo tolerance

**Alternatives considered:**
- Elasticsearch → Rejected: Overkill for MVP, adds infrastructure complexity
- Simple LIKE queries → Rejected: Poor performance, no ranking
- pgvector semantic search → Deferred: Useful for AI recommendations later, not needed for basic search

### Decision 4: Video Validation

**What:** Validate videos on upload: format (MP4/MOV/AVI), size (≤100MB), resolution (≥720p).

**Why:**
- Ensures consistent playback across browsers (H.264 codec)
- Prevents storage abuse (100MB limit)
- Maintains quality for biomechanical analysis (720p minimum)

**Implementation:**
- Use `python-magic` for MIME type detection
- Use `FFmpeg` to extract resolution and codec info
- Reject invalid files before uploading to MinIO

## Architecture

### Database Schema

```
drills
├── id (UUID, PK)
├── title (VARCHAR)
├── description (TEXT)
├── difficulty (ENUM: beginner, intermediate, advanced)
├── focus_area (ENUM: technique, physical, mental, tactical)
├── equipment (TEXT[])
├── metadata (JSONB) - extensible field for future attributes
├── created_at, updated_at, deleted_at (TIMESTAMP)

exercises (same structure as drills)

tips
├── id (UUID, PK)
├── title (VARCHAR)
├── content (TEXT)
├── category (VARCHAR)
├── focus_area (ENUM)
├── created_at, updated_at, deleted_at

training_programs
├── id (UUID, PK)
├── title (VARCHAR)
├── description (TEXT)
├── duration_weeks (INT)
├── difficulty (ENUM)
├── program_data (JSONB) - structured program content
├── created_at, updated_at, deleted_at

videos
├── id (UUID, PK)
├── filename (VARCHAR)
├── storage_path (VARCHAR) - MinIO bucket path
├── url (VARCHAR) - signed URL (generated on-demand)
├── thumbnail_url (VARCHAR)
├── duration (INT) - seconds
├── size_bytes (BIGINT)
├── format (VARCHAR)
├── metadata (JSONB)
├── uploaded_by (UUID, FK → users)
├── created_at, deleted_at

drill_videos (many-to-many junction)
├── drill_id (UUID, FK)
├── video_id (UUID, FK)
├── order (INT) - for sorting videos

exercise_videos, tip_videos, program_videos (similar junction tables)
```

### API Routes

```
POST   /api/v1/videos/upload
GET    /api/v1/videos/:id
DELETE /api/v1/videos/:id

POST   /api/v1/knowledge-base/drills
GET    /api/v1/knowledge-base/drills
GET    /api/v1/knowledge-base/drills/:id
PUT    /api/v1/knowledge-base/drills/:id
DELETE /api/v1/knowledge-base/drills/:id
POST   /api/v1/knowledge-base/drills/:id/videos

(Similar routes for exercises, tips, programs)

GET    /api/v1/knowledge-base/search?q=...&type=...&focus_area=...&difficulty=...
```

### Service Layer

```
StorageService (MinIO client)
├── upload_video(file, metadata) → video_id
├── get_signed_url(video_id, expiration=3600) → url
├── delete_video(video_id)
└── generate_thumbnail(video_id) → thumbnail_url

KnowledgeBaseService
├── create_drill(data) → drill
├── get_drills(filters) → drills[]
├── attach_video(drill_id, video_id)
└── search(query, filters) → results[]
```

## Risks / Trade-offs

### Risk 1: Storage Costs
**Mitigation:**
- 100MB max per video
- 1GB quota per user (enforced in code)
- Soft delete with cleanup job (delete after 30 days)
- Monitor storage usage in admin dashboard

### Risk 2: Video Playback Compatibility
**Mitigation:**
- Validate H.264 codec on upload (most compatible)
- Reject unsupported formats
- Add transcoding in future if needed (out of scope for MVP)

### Risk 3: Search Performance
**Mitigation:**
- Add indexes on frequently queried columns (focus_area, difficulty, created_at)
- Use pg_trgm for efficient fuzzy search
- Implement pagination (max 50 results per page)
- Monitor query performance, add Elasticsearch if needed later

## Migration Plan

### Phase 1: Infrastructure Setup
1. Add MinIO to `docker-compose.yml`
2. Create database migrations for new tables
3. Install Python dependencies (`minio`, `python-magic`, `Pillow`, `FFmpeg`)

### Phase 2: Backend Implementation
1. Implement `StorageService` and test with sample videos
2. Implement `KnowledgeBaseService` CRUD operations
3. Create API routes with authentication/authorization

### Phase 3: Frontend Implementation
1. Build admin dashboard for content management
2. Build video upload component
3. Build knowledge base browser for end users

### Phase 4: Testing and Validation
1. Unit tests for services
2. Integration tests for full upload flow
3. Manual testing with real videos

### Rollback Plan
- Database migrations are reversible (Alembic downgrade)
- MinIO data can be deleted (no dependencies yet)
- Feature flag to disable knowledge base routes if critical issues

## User Decisions (Resolved)

1. **Coach Write Access**: ✅ Resolved - Admin-only write access for knowledge base content
2. **Video Import Method**: ✅ Resolved - Manual upload only (no YouTube/Instagram scraping)
3. **Video Transcoding**: Deferred to future - Reject unsupported formats for MVP
