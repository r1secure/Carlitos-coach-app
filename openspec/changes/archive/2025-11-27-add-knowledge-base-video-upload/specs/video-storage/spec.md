## ADDED Requirements

### Requirement: Video Upload

The system SHALL allow authenticated admin users to upload video files to MinIO storage with validation.

#### Scenario: Admin uploads valid video

- **WHEN** an authenticated admin user sends POST request to `/api/v1/videos/upload` with a video file (MP4, MOV, or AVI format, ≤100MB, ≥720p resolution)
- **THEN** the system SHALL validate the file format using python-magic
- **AND** validate the file size is ≤100MB
- **AND** validate the resolution is ≥720p using FFmpeg
- **AND** generate a unique filename (UUID + timestamp + original extension)
- **AND** upload the file to MinIO bucket
- **AND** generate a thumbnail image (first frame at 1 second)
- **AND** save video metadata to database (filename, storage_path, duration, size_bytes, format, uploaded_by)
- **AND** return HTTP 201 with video object including video ID

#### Scenario: Admin uploads video with invalid format

- **WHEN** an authenticated admin uploads a file with unsupported format (e.g., .webm, .mkv)
- **THEN** the system SHALL return HTTP 400 with error message "Unsupported video format. Allowed: MP4, MOV, AVI"
- **AND** NOT upload the file to MinIO
- **AND** NOT create a database record

#### Scenario: Admin uploads video exceeding size limit

- **WHEN** an authenticated admin uploads a video file >100MB
- **THEN** the system SHALL return HTTP 413 Payload Too Large
- **AND** NOT upload the file to MinIO

#### Scenario: Admin uploads video with resolution below 720p

- **WHEN** an authenticated admin uploads a video with resolution <720p (e.g., 640x480)
- **THEN** the system SHALL return HTTP 400 with error message "Video resolution must be at least 720p"
- **AND** NOT upload the file to MinIO

#### Scenario: Non-admin user attempts to upload video

- **WHEN** an authenticated non-admin user (player or coach) attempts to upload a video
- **THEN** the system SHALL return HTTP 403 Forbidden
- **AND** NOT upload the file

### Requirement: Video Retrieval

The system SHALL provide secure access to uploaded videos via signed URLs with expiration.

#### Scenario: User retrieves video metadata and signed URL

- **WHEN** an authenticated user sends GET request to `/api/v1/videos/:id`
- **THEN** the system SHALL return HTTP 200 with video metadata (id, filename, duration, size_bytes, format, created_at)
- **AND** include a signed URL valid for 1 hour
- **AND** include a thumbnail URL
- **AND** return HTTP 404 if video does not exist or is soft-deleted

#### Scenario: User accesses video via signed URL

- **WHEN** a user accesses the signed URL returned by the API
- **THEN** MinIO SHALL serve the video file
- **AND** the URL SHALL expire after 1 hour
- **AND** return HTTP 403 if URL is expired

#### Scenario: User retrieves thumbnail

- **WHEN** an authenticated user sends GET request to `/api/v1/videos/:id/thumbnail`
- **THEN** the system SHALL return HTTP 200 with the thumbnail image URL
- **AND** the thumbnail SHALL be a JPEG image (320x180 resolution)

### Requirement: Video Deletion

The system SHALL allow admins to soft delete videos, removing them from active use but retaining the file.

#### Scenario: Admin soft deletes video

- **WHEN** an authenticated admin sends DELETE request to `/api/v1/videos/:id`
- **THEN** the system SHALL set the deleted_at timestamp in the database
- **AND** return HTTP 204 No Content
- **AND** the video SHALL no longer appear in video lists or be attachable to knowledge base items
- **AND** the video file SHALL remain in MinIO storage (not physically deleted)

#### Scenario: Admin attempts to delete video attached to knowledge base item

- **WHEN** an authenticated admin deletes a video that is attached to one or more drills/exercises
- **THEN** the system SHALL still soft delete the video
- **AND** the video SHALL be removed from the associated knowledge base items (cascade delete junction records)

### Requirement: Storage Quota Management

The system SHALL enforce a 1GB storage quota per user for uploaded videos.

#### Scenario: User uploads video within quota

- **WHEN** an authenticated admin uploads a video and their total storage usage (including new video) is ≤1GB
- **THEN** the system SHALL allow the upload

#### Scenario: User uploads video exceeding quota

- **WHEN** an authenticated admin uploads a video that would exceed their 1GB quota
- **THEN** the system SHALL return HTTP 507 Insufficient Storage with error message "Storage quota exceeded. Delete old videos to free up space."
- **AND** NOT upload the file

#### Scenario: Admin views storage usage

- **WHEN** an authenticated admin sends GET request to `/api/v1/videos/quota`
- **THEN** the system SHALL return HTTP 200 with current usage in bytes and percentage of quota used

### Requirement: Thumbnail Generation

The system SHALL automatically generate a thumbnail image for each uploaded video.

#### Scenario: Thumbnail generated on upload

- **WHEN** a video is successfully uploaded
- **THEN** the system SHALL use FFmpeg to extract a frame at 1 second into the video
- **AND** resize the frame to 320x180 resolution (16:9 aspect ratio)
- **AND** save the thumbnail as JPEG to MinIO
- **AND** store the thumbnail URL in the video metadata

#### Scenario: Thumbnail generation fails

- **WHEN** FFmpeg fails to generate a thumbnail (e.g., video is corrupted)
- **THEN** the system SHALL log the error
- **AND** still save the video metadata with thumbnail_url set to null
- **AND** return HTTP 201 (upload still succeeds)
