# Implement Player Video Upload

## Summary
Enable "Player" users to upload and manage their own videos. This includes updating permissions, enforcing storage quotas, and providing a frontend interface for video management.

## Motivation
The core value of Carlitos is biomechanical analysis of player videos. Currently, only Admins can upload videos. To enable the "Player Space" features, players must be able to upload their own content.

## Proposed Changes
1.  **Backend**:
    *   Update `video-storage` spec to allow `PLAYER` role uploads.
    *   Enforce 1GB storage quota per player.
    *   Implement "My Videos" endpoint to list only the user's videos.
2.  **Frontend**:
    *   Create "My Videos" page in the Dashboard.
    *   Integrate `VideoUpload` component for players.
    *   Display list of uploaded videos with status.
