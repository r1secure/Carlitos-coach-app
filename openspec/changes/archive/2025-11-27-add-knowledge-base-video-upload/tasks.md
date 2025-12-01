# Implementation Tasks

## 1. Database Schema and Models

- [x] 1.1 Create Alembic migration for knowledge base tables
  - [x] `drills` table (id, title, description, difficulty, focus_area, equipment, metadata JSONB, created_at, updated_at, deleted_at)
  - [x] `exercises` table (similar structure to drills)
  - [x] `tips` table (id, title, content, category, focus_area, created_at, updated_at)
  - [x] `training_programs` table (id, title, description, duration_weeks, difficulty, program_data JSONB, created_at, updated_at)
  - [x] `videos` table (id, filename, storage_path, url, thumbnail_url, duration, size_bytes, format, metadata JSONB, uploaded_by, created_at, deleted_at)
  - [x] Junction tables for many-to-many relationships (drill_videos, exercise_videos, etc.)
  - [x] Add indexes on frequently queried columns (focus_area, difficulty, created_at)
  
- [x] 1.2 Create SQLAlchemy models
  - [x] `models/drill.py` - Drill model with relationships
  - [x] `models/exercise.py` - Exercise model
  - [x] `models/tip.py` - Tip model
  - [x] `models/training_program.py` - TrainingProgram model
  - [x] `models/video.py` - Video model with MinIO path

## 2. MinIO Storage Setup

- [x] 2.1 Add MinIO service to `docker-compose.yml`
  - [x] Configure MinIO container (ports 9000/9001)
  - [x] Set up environment variables (access key, secret key)
  - [x] Create persistent volume for data

- [x] 2.2 Create MinIO client service
  - [x] `services/storage_service.py` - MinIO client wrapper
  - [x] Implement upload_video() method
  - [x] Implement get_video_url() with expiration
  - [x] Implement delete_video() method
  - [x] Create bucket initialization on startup

## 3. Backend API - Video Storage

- [x] 3.1 Create video upload endpoint
  - [x] `routes/videos.py` - POST /api/v1/videos/upload
  - [x] Validate file format (MP4, MOV, AVI)
  - [x] Validate file size (max 100MB)
  - [x] Validate resolution (min 720p) using FFmpeg
  - [x] Generate unique filename (UUID + timestamp)
  - [x] Upload to MinIO
  - [x] Generate thumbnail using FFmpeg
  - [x] Save metadata to database

- [x] 3.2 Create video retrieval endpoints
  - [x] GET /api/v1/videos/:id - Get video metadata and signed URL
  - [x] GET /api/v1/videos/:id/thumbnail - Get thumbnail URL
  - [x] DELETE /api/v1/videos/:id - Soft delete video (admin only)

## 4. Backend API - Knowledge Base

- [x] 4.1 Create drill endpoints
  - [x] POST /api/v1/knowledge-base/drills - Create drill (admin only)
  - [x] GET /api/v1/knowledge-base/drills - List/search drills
  - [x] GET /api/v1/knowledge-base/drills/:id - Get drill details
  - [x] PUT /api/v1/knowledge-base/drills/:id - Update drill (admin only)
  - [x] DELETE /api/v1/knowledge-base/drills/:id - Soft delete drill (admin only)
  - [x] POST /api/v1/knowledge-base/drills/:id/videos - Attach video to drill

- [x] 4.2 Create exercise endpoints (same structure as drills)
  - [x] POST /api/v1/knowledge-base/exercises
  - [x] GET /api/v1/knowledge-base/exercises
  - [x] GET /api/v1/knowledge-base/exercises/:id
  - [x] PUT /api/v1/knowledge-base/exercises/:id
  - [x] DELETE /api/v1/knowledge-base/exercises/:id

- [x] 4.3 Create tip endpoints
  - [x] POST /api/v1/knowledge-base/tips
  - [x] GET /api/v1/knowledge-base/tips
  - [x] GET /api/v1/knowledge-base/tips/:id
  - [x] PUT /api/v1/knowledge-base/tips/:id
  - [x] DELETE /api/v1/knowledge-base/tips/:id

- [x] 4.4 Create training program endpoints
  - [x] POST /api/v1/knowledge-base/programs
  - [x] GET /api/v1/knowledge-base/programs
  - [x] GET /api/v1/knowledge-base/programs/:id
  - [x] PUT /api/v1/knowledge-base/programs/:id
  - [x] DELETE /api/v1/knowledge-base/programs/:id

- [x] 4.5 Implement search functionality
  - [x] GET /api/v1/knowledge-base/search?q=query&type=drill|exercise|tip|program&focus_area=technique|physical|mental|tactical&difficulty=beginner|intermediate|advanced
  - [x] Use PostgreSQL full-text search (pg_trgm extension)

## 5. Frontend - Admin Dashboard

- [x] 5.1 Create knowledge base management UI
  - [x] `/app/admin/knowledge-base/page.tsx` - Main dashboard
  - [x] Tabs for Drills, Exercises, Tips, Programs
  - [x] Create/Edit forms for each content type
  - [x] Delete confirmation modals

- [x] 5.2 Create video upload component
  - [x] `components/VideoUpload.tsx` - Drag & drop zone
  - [x] Progress bar for upload
  - [x] Video preview after upload
  - [x] Thumbnail generation preview
  - [x] Error handling (format, size validation)

## 6. Frontend - Knowledge Base Browser

- [x] 6.1 Create public knowledge base browser
  - [x] `/app/knowledge-base/page.tsx` - Main browser
  - [x] Filter sidebar (type, focus area, difficulty)
  - [x] Search bar with autocomplete
  - [x] Card grid layout for items
  - [x] Pagination

- [x] 6.2 Create detail pages
  - [x] `/app/knowledge-base/drills/[id]/page.tsx` - Drill detail
  - [x] Display description, metadata, attached videos
  - [x] Video player with controls
  - [x] Similar pages for exercises, tips, programs

## 7. Testing

- [ ] 7.1 Backend unit tests
  - [ ] Test video upload validation
  - [ ] Test MinIO storage operations
  - [ ] Test knowledge base CRUD operations
  - [ ] Test search functionality

- [ ] 7.2 Integration tests
  - [ ] Test full video upload flow (API → MinIO → DB)
  - [ ] Test knowledge base creation with video attachment

- [x] 7.3 Manual testing
  - [x] Upload various video formats and sizes
  - [x] Test video playback in browser
  - [x] Test search with different filters
  - [x] Test admin permissions (only admins can create/edit)

## 8. Documentation

- [x] 8.1 Update API documentation (OpenAPI/Swagger)
- [x] 8.2 Add README for MinIO setup in docker-compose
- [x] 8.3 Document video format requirements and limitations
