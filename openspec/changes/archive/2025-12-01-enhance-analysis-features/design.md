# Design: Advanced Analysis & Comparison

## Architecture

### 1. Biomechanical Metrics (Backend)
We will extend the `AnalysisService` to post-process the MediaPipe landmarks.
*   **Input**: List of frames with 33 pose landmarks (x, y, z, visibility).
*   **Processing**:
    *   Calculate vectors between key joints (e.g., Hip-Knee, Knee-Ankle).
    *   Compute angles using dot product.
    *   Key Angles:
        *   **Knee Flexion**: Hip-Knee-Ankle
        *   **Elbow Flexion**: Shoulder-Elbow-Wrist
        *   **Shoulder Rotation**: Hip-Shoulder-Elbow (approximate in 2D)
*   **Output**: Enriched `Analysis` data structure containing `metrics` per frame.

### 2. Playback Control (Frontend)
*   Use standard HTML5 `HTMLMediaElement.playbackRate`.
*   Add UI controls (Dropdown or Toggle) for 0.5x, 1.0x.

### 3. Comparison Mode (Frontend)
*   **UI Layout**: Side-by-side video players.
*   **Synchronization**:
    *   Master-Slave control: Playing/Pausing one controls the other? Or independent?
    *   *Decision*: Independent controls initially, with a "Sync Play" button as a nice-to-have.
*   **Pro Video Source**:
    *   We need a "Pro Models" section in the database.
    *   Reuse `Video` model but add a flag or category `is_pro_model`.
    *   Or just use existing Knowledge Base `Drill` videos if they are suitable.
    *   *Decision*: Add `is_reference` boolean to `Video` model.

## Database Schema Changes
*   **Analysis**: No schema change needed if we store metrics inside the `data` JSONB column.
*   **Video**: Add `is_reference` (boolean, default False) to mark videos as "Pro/Reference" models.

## API Changes
*   `GET /api/v1/videos/references`: List available pro videos for comparison.
