# Implement Video Analysis Pipeline

## Why
The core value proposition of Carlitos Coach is the biomechanical analysis of tennis strokes. Currently, users can upload videos, but no analysis is performed. We need to implement the pipeline to process these videos, extract pose landmarks, and visualize them to the user.

## Context
-   **Video Storage**: Already implemented (MinIO).
-   **Tech Stack**: MediaPipe (Python) is chosen for pose detection.
-   **Infrastructure**: Celery is available for async tasks.

## What Changes
1.  **Backend**:
    -   Create `AnalysisService` to handle MediaPipe processing.
    -   Create `Analysis` model to store results (JSONB for landmarks).
    -   Update `Video` model to link to `Analysis`.
    -   Create Celery task `process_video_analysis` triggered after upload.
    -   Create `GET /api/v1/videos/{id}/analysis` endpoint.

2.  **Frontend**:
    -   Update `VideoPlayer` to overlay pose landmarks (using HTML5 Canvas or SVG).
    -   Display basic metrics (if available in MVP, otherwise just visual overlay).

## Risks
-   **Performance**: Processing might be slow on CPU. Need to ensure async task doesn't block.
-   **Accuracy**: MediaPipe might fail on fast movements or occlusions.
-   **Storage**: Landmark data can be large for long videos.

## Out of Scope
-   Advanced metrics (speed, angles) - strictly landmarks for now.
-   AI/LLM feedback.
-   Comparison with pro players.
