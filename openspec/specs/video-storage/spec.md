# video-storage Specification

## Purpose
TBD - created by archiving change add-knowledge-base-video-upload. Update Purpose after archive.
## Requirements
### Requirement: Video Upload

The system SHALL allow authenticated users (Admin and Player) to upload video files to MinIO storage with validation.

#### Scenario: Player uploads valid video
- **WHEN** an authenticated **player** user sends POST request to `/api/v1/videos/upload` with a valid video file
- **THEN** the system SHALL allow the upload (subject to quota)
- **AND** associate the video with the current user

### Requirement: Video Retrieval

The system SHALL provide secure access to uploaded videos via signed URLs with expiration.

#### Scenario: Player lists their own videos
- **WHEN** an authenticated player sends GET request to `/api/v1/videos/my-videos`
- **THEN** the system SHALL return HTTP 200 with a list of videos uploaded by that user
- **AND** NOT include videos from other users

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

#### Scenario: Player quota enforcement
- **WHEN** a player attempts to upload a video
- **THEN** the system SHALL check if `current_usage + new_video_size <= 1GB`
- **AND** return HTTP 507 if quota exceeded

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

