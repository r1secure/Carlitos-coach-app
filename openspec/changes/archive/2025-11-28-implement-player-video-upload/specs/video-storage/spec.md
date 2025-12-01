# video-storage Spec Delta

## MODIFIED Requirements

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

### Requirement: Storage Quota Management

The system SHALL enforce a 1GB storage quota per user for uploaded videos.

#### Scenario: Player quota enforcement
- **WHEN** a player attempts to upload a video
- **THEN** the system SHALL check if `current_usage + new_video_size <= 1GB`
- **AND** return HTTP 507 if quota exceeded
