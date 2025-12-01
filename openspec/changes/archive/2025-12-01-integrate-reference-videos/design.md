# Design: Integrate Reference Videos into Knowledge Base

## Backend Design

### API Changes
- **`GET /api/v1/knowledge-base/references`**:
    - Returns list of videos with `is_reference=True`.
    - Response format compatible with KB search results (id, title, description, type='reference').
- **`GET /api/v1/knowledge-base/search`**:
    - Add `reference` to `type` filter.
    - Include references in "all" search.
- **`PUT /api/v1/videos/{video_id}/reference`** (Admin):
    - Body: `{"is_reference": boolean, "metadata": {...}}`
    - Updates `is_reference` flag and `extra_metadata`.

### Data Model
- No schema changes needed.
- `Video.extra_metadata` will store:
    - `player_name`: string
    - `stroke_type`: string (Forehand, Backhand, Serve, etc.)
    - `tags`: list[string]

## Frontend Design

### Knowledge Base Page
- Add "Modèles" tab/filter.
- Render Reference Cards:
    - Thumbnail
    - Title: "{Player Name} - {Stroke Type}" (or filename if metadata missing)
    - Badge: "Reference"

### Admin Interface
- New Page: `/admin/knowledge-base/references`
- Table listing all videos.
- Columns: Thumbnail, Filename, Is Reference (Toggle), Metadata (Edit Button).
- Edit Dialog:
    - Inputs for Player Name, Stroke Type.
    - Toggle for Is Reference.

## Security
- Admin routes protected by `superuser` dependency.
- Public routes accessible to authenticated users.
