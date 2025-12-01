# Design: Video Analysis Pipeline

## Architecture

### Data Flow
1.  **Upload**: User uploads video -> MinIO (Existing).
2.  **Trigger**: `Video` created -> Celery Task `analyze_video` dispatched.
3.  **Processing**:
    -   Worker downloads video from MinIO (or accesses local volume).
    -   MediaPipe processes frame-by-frame.
    -   Landmarks extracted and normalized.
4.  **Storage**:
    -   Landmarks stored in `Analysis` table (JSONB column `data`).
    -   Structure: `[{frame: 0, timestamp: 0.0, landmarks: [...]}, ...]`
5.  **Consumption**:
    -   Frontend requests analysis data.
    -   VideoPlayer syncs current time with analysis frame.
    -   Canvas draws lines/points over video.

### Database Schema
```python
class Analysis(Base):
    __tablename__ = "analyses"
    id = Column(UUID, primary_key=True)
    video_id = Column(UUID, ForeignKey("videos.id"))
    status = Column(String) # PENDING, PROCESSING, COMPLETED, FAILED
    data = Column(JSONB) # The heavy payload
    created_at = Column(DateTime)
```

### MediaPipe Configuration
-   Model: `pose_landmarker_heavy` (for accuracy).
-   Mode: Video (maintains state between frames).
-   Smoothing: Enabled.

## UI/UX
-   **Video Player**: Toggle button "Show Analysis".
-   **Loading State**: If analysis is processing, show spinner/badge.
-   **Overlay**:
    -   Skeleton lines in bright color (e.g., Neon Green `00FF00`).
    -   Points at joints.
    -   Opacity control (optional).
