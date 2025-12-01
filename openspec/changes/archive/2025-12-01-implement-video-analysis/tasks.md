# Tasks: Implement Video Analysis Pipeline

- [x] **1. Backend: Analysis Model & Service**
    - [x] Create `Analysis` SQLAlchemy model (One-to-One with Video).
    - [x] Create `AnalysisService` class with `process_video(video_path)` method using MediaPipe.
    - [x] Implement `extract_landmarks` logic.

- [x] **2. Backend: Async Processing**
    - [x] Create Celery task `analyze_video_task`.
    - [x] Trigger task on video upload completion (or manual trigger).
    - [x] Update `Video` status (PROCESSING -> READY/FAILED).

- [x] **3. Backend: API Endpoints**
    - [x] Create `GET /api/v1/videos/{video_id}/analysis` to fetch landmark data.
    - [x] Create `POST /api/v1/videos/{video_id}/analyze` to manually trigger analysis (for testing/retry).

- [x] **4. Frontend: Visualization**
    - [x] Create `PoseOverlay` component (Canvas-based).
    - [x] Integrate `PoseOverlay` into `VideoPlayer`.
    - [x] Fetch and sync analysis data with video playback time.

- [ ] **5. Verification**
    - [ ] Test with sample tennis videos.
    - [ ] Verify landmark accuracy visually.
    - [ ] Check performance and database load.
