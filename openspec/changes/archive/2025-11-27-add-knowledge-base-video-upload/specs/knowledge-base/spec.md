## ADDED Requirements

### Requirement: Knowledge Base Content Management

The system SHALL provide CRUD operations for four types of coaching content: Drills, Exercises, Tips, and Training Programs.

#### Scenario: Admin creates a new drill

- **WHEN** an authenticated admin user submits a POST request to `/api/v1/knowledge-base/drills` with valid drill data (title, description, difficulty, focus_area, equipment)
- **THEN** the system SHALL create a new drill record in the database
- **AND** return HTTP 201 with the created drill object including a unique ID
- **AND** set created_at and updated_at timestamps

#### Scenario: Admin creates drill with invalid data

- **WHEN** an authenticated admin user submits a POST request with missing required fields (e.g., no title)
- **THEN** the system SHALL return HTTP 400 with validation error details
- **AND** NOT create a drill record

#### Scenario: Non-admin user attempts to create drill

- **WHEN** an authenticated non-admin user (player or coach) submits a POST request to create a drill
- **THEN** the system SHALL return HTTP 403 Forbidden
- **AND** NOT create a drill record

#### Scenario: User retrieves list of drills with filters

- **WHEN** an authenticated user sends GET request to `/api/v1/knowledge-base/drills?focus_area=technique&difficulty=intermediate`
- **THEN** the system SHALL return HTTP 200 with an array of drills matching the filters
- **AND** include pagination metadata (total count, page number, page size)
- **AND** exclude soft-deleted drills

#### Scenario: User retrieves single drill with videos

- **WHEN** an authenticated user sends GET request to `/api/v1/knowledge-base/drills/:id`
- **THEN** the system SHALL return HTTP 200 with the drill object
- **AND** include all associated videos with signed URLs
- **AND** return HTTP 404 if drill does not exist or is soft-deleted

#### Scenario: Admin updates existing drill

- **WHEN** an authenticated admin user sends PUT request to `/api/v1/knowledge-base/drills/:id` with updated data
- **THEN** the system SHALL update the drill record
- **AND** update the updated_at timestamp
- **AND** return HTTP 200 with the updated drill object

#### Scenario: Admin soft deletes drill

- **WHEN** an authenticated admin user sends DELETE request to `/api/v1/knowledge-base/drills/:id`
- **THEN** the system SHALL set the deleted_at timestamp
- **AND** return HTTP 204 No Content
- **AND** the drill SHALL no longer appear in list/search results

### Requirement: Knowledge Base Search

The system SHALL provide full-text search across all knowledge base content types with filtering capabilities.

#### Scenario: User searches for drills by keyword

- **WHEN** an authenticated user sends GET request to `/api/v1/knowledge-base/search?q=forehand&type=drill`
- **THEN** the system SHALL return HTTP 200 with drills matching "forehand" in title or description
- **AND** use PostgreSQL pg_trgm for fuzzy matching (typo tolerance)
- **AND** rank results by relevance
- **AND** limit results to 50 per page

#### Scenario: User searches with multiple filters

- **WHEN** an authenticated user searches with `?q=serve&type=drill&focus_area=technique&difficulty=advanced`
- **THEN** the system SHALL return drills matching all criteria (keyword AND type AND focus_area AND difficulty)
- **AND** return empty array if no matches found

#### Scenario: User searches without query parameter

- **WHEN** an authenticated user sends GET request to `/api/v1/knowledge-base/search?type=exercise&focus_area=physical`
- **THEN** the system SHALL return all exercises with focus_area=physical
- **AND** apply pagination

### Requirement: Video Association with Knowledge Base Items

The system SHALL allow admins to attach multiple videos to drills, exercises, tips, and training programs.

#### Scenario: Admin attaches video to drill

- **WHEN** an authenticated admin user sends POST request to `/api/v1/knowledge-base/drills/:drill_id/videos` with `{"video_id": "uuid", "order": 1}`
- **THEN** the system SHALL create a drill_videos junction record
- **AND** return HTTP 201 with the updated drill including all videos
- **AND** return HTTP 404 if drill or video does not exist

#### Scenario: Admin attaches same video to multiple drills

- **WHEN** an authenticated admin attaches video A to drill 1 and drill 2
- **THEN** the system SHALL allow the association (many-to-many relationship)
- **AND** the video SHALL appear in both drills' video lists

#### Scenario: Admin removes video from drill

- **WHEN** an authenticated admin sends DELETE request to `/api/v1/knowledge-base/drills/:drill_id/videos/:video_id`
- **THEN** the system SHALL delete the junction record
- **AND** return HTTP 204 No Content
- **AND** the video file SHALL remain in storage (not deleted)

### Requirement: Content Type Schemas

The system SHALL enforce the following schemas for each content type.

#### Scenario: Drill schema validation

- **WHEN** creating or updating a drill
- **THEN** the system SHALL require: title (string, max 200 chars), description (text), difficulty (enum: beginner|intermediate|advanced), focus_area (enum: technique|physical|mental|tactical)
- **AND** optionally accept: equipment (array of strings), metadata (JSONB for extensibility)

#### Scenario: Exercise schema validation

- **WHEN** creating or updating an exercise
- **THEN** the system SHALL use the same schema as drills (title, description, difficulty, focus_area, equipment, metadata)

#### Scenario: Tip schema validation

- **WHEN** creating or updating a tip
- **THEN** the system SHALL require: title (string, max 200 chars), content (text), category (string), focus_area (enum)

#### Scenario: Training program schema validation

- **WHEN** creating or updating a training program
- **THEN** the system SHALL require: title (string), description (text), duration_weeks (integer, min 1, max 52), difficulty (enum), program_data (JSONB containing structured program content)
