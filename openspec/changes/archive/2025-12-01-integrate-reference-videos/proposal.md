# Integrate Reference Videos into Knowledge Base

## Goal
Integrate "Reference Videos" (Modèles de Référence) as a first-class citizen in the Knowledge Base, allowing users to browse them and admins to manage them.

## Context
Currently, reference videos are just `Video` records with `is_reference=True`. Users want to see them "defined" in the Knowledge Base, implying they should be browsable alongside Drills and Exercises, and manageable via the Admin UI.

## Changes

### Backend
- **Update `Video` Model**: Ensure `extra_metadata` is used for "Player Name", "Stroke Type", etc.
- **Knowledge Base API**:
    - Add `GET /api/v1/knowledge-base/references` to list reference videos.
    - Update `GET /api/v1/knowledge-base/search` to include reference videos in results.
- **Admin API**:
    - Add endpoints to manage reference metadata (update `extra_metadata`, toggle `is_reference`).

### Frontend
- **Knowledge Base**:
    - Add "Modèles" (References) to the type filter.
    - Display reference videos in the grid.
    - Create a details view for reference videos (or reuse VideoPlayer).
- **Admin**:
    - Create `frontend/src/app/admin/knowledge-base/references/page.tsx`.
    - UI to:
        - List all videos.
        - Toggle "Is Reference".
        - Edit metadata (Player, Stroke).

## Risks
- **Search Complexity**: Mixing different types in search results might require careful typing.
- **Video vs Content**: References are just videos, while other KB items are content *wrapping* videos. We need to treat them consistently in the UI.

## Out of Scope
- Advanced video editing.
