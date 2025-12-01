# Proposal: Enhance Video Analysis Features

## Why
The current video analysis pipeline provides basic skeleton visualization but lacks actionable insights. Users need quantitative metrics (angles, speed) and visual tools (slow motion, pro comparison) to effectively improve their technique.

## Context
We have a working pipeline that extracts and stores MediaPipe pose landmarks. We now need to process these landmarks to derive biomechanical metrics and enhance the frontend player to support advanced playback and comparison modes.

## What Changes
1.  **Backend Analysis**:
    *   Update `AnalysisService` to calculate joint angles (e.g., knee flexion, elbow extension).
    *   Store these computed metrics in the `Analysis` model (or a new related model).
2.  **Frontend Player**:
    *   Add playback speed control (0.5x, 0.75x, 1x).
    *   Display calculated metrics overlay.
3.  **Comparison Mode**:
    *   Implement a "Split Screen" or "Overlay" view.
    *   Allow selecting a "Pro" video (from a curated list in Knowledge Base) to compare against.

## Risks
*   **Metric Accuracy**: 2D pose estimation has limitations; angles might be inaccurate depending on camera perspective. We must add disclaimers.
*   **Performance**: Dual video playback + canvas overlays might be heavy for some devices.
*   **Pro Content**: We need a source of pro videos. For MVP, we might need to manually seed a few.

## Out of Scope
*   3D reconstruction (Monocular Depth Estimation).
*   AI-based automated coaching feedback (LLM integration).
