# Change: Add Knowledge Base and Video Upload System

## Why

Carlitos v3 needs a comprehensive knowledge base to store tennis coaching content (drills, exercises, tips, training programs, and reference videos) that will be used to:
1. Provide personalized training recommendations to players based on their analysis
2. Offer a searchable library of coaching resources for both players and coaches
3. Populate the system with professional reference videos (via YouTube/Instagram scraping) for comparison with user technique

Currently, there is no system to store, manage, or retrieve this coaching content. This is a foundational capability required before implementing user video analysis and AI-powered recommendations.

## What Changes

This change introduces two new capabilities:

### 1. Knowledge Base Management
- Create, read, update, delete (CRUD) operations for coaching content
- Support for four content types: **Drills**, **Exercises**, **Tips**, and **Training Programs**
- Each item can include text descriptions, metadata (difficulty, focus area, equipment), and associated reference videos
- Full-text search and filtering by category, difficulty level, and focus area (technique, physical, mental, tactical)
- Admin-only write access, read access for all authenticated users

### 2. Video Storage System
- Upload video files to MinIO (S3-compatible storage)
- Support for MP4, MOV, AVI formats (max 100MB per file)
- Automatic video validation (format, size, resolution ≥720p)
- Generate video thumbnails for preview
- Secure URL generation with expiration for video access
- Storage quota management (1GB per user initially)



## Impact

### Affected Specs
- **NEW**: `specs/knowledge-base/spec.md` - Knowledge base CRUD and search
- **NEW**: `specs/video-storage/spec.md` - Video upload and storage management

### Affected Code
- **Backend (FastAPI)**:
  - New routes: `/api/v1/knowledge-base/*`, `/api/v1/videos/*`
  - New models: `Drill`, `Exercise`, `Tip`, `TrainingProgram`, `Video`
  - New services: `KnowledgeBaseService`, `VideoStorageService`
  - Database migrations for new tables
- **Frontend (Next.js)**:
  - Admin dashboard for content management
  - Knowledge base browser/search interface
  - Video upload component with progress tracking
- **Infrastructure**:
  - MinIO service configuration in Docker Compose
  - PostgreSQL schema updates (new tables with JSONB fields)

### Dependencies
- New Python packages: `python-magic`, `Pillow` (thumbnail generation)
- MinIO client library: `minio`
- FFmpeg (system dependency for video processing)

### Breaking Changes
None - this is a new capability with no existing functionality to break.

## User Decisions (Approved)

> [!NOTE]
> **Storage Costs**: ✅ Approved - 3GB MinIO storage for MVP (1GB per user × 2-3 users)

> [!NOTE]
> **Video Import Method**: ✅ Approved - Manual upload only (no YouTube/Instagram scraping)

> [!NOTE]
> **Admin Access Control**: ✅ Approved - Admin-only write access for knowledge base content
