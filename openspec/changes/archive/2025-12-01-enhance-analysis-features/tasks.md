# Tasks: Enhance Video Analysis Features

- [x] **1. Backend: Metrics Calculation**
    - [x] Update `AnalysisService` to calculate angles (knee, elbow, shoulder).
    - [x] Update `Analysis` model/schema to include `metrics` in the data structure.
    - [x] Re-run analysis for existing videos (optional/manual trigger).

- [x] **2. Backend: Reference Videos**
    - [x] Update `Video` model to add `is_reference` boolean.
    - [x] Create migration script.
    - [x] Add `GET /api/v1/videos/references` endpoint.
    - [x] Seed at least one reference video (manual DB update or admin UI).

- [x] **3. Frontend: Playback Control**
    - [x] Update `VideoPlayer` to add speed control (0.5x, 1x).
    - [x] Ensure `PoseOverlay` syncs correctly at different speeds.

- [x] **4. Frontend: Metrics Visualization**
    - [x] Update `PoseOverlay` to draw angle values on the canvas.
    - [x] Add a side-panel or overlay to show current frame metrics.

- [x] **5. Frontend: Comparison Mode**
    - [x] Create `ComparisonPlayer` component (side-by-side).
    - [x] Add UI to select a reference video.
    - [x] Implement synchronized playback controls (Play/Pause both).

- [x] **6. Verification**
    - [x] Verify angle calculations are reasonable.
    - [x] Test slow motion sync.
    - [x] Test comparison mode performance.
