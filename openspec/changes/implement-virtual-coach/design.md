# Design: Virtual Coach Intelligence

## Architecture

### LLM Integration
We will use `litellm` to abstract the LLM provider, defaulting to **Gemini 1.5 Flash** for speed and cost-efficiency, or **Gemini 1.5 Pro** for complex reasoning.

### Feedback Generation Flow
1.  **Trigger**: User opens video analysis or explicit "Generate Feedback" button.
2.  **Input**:
    -   Video Metadata (Stroke type, Player level).
    -   Analysis Metrics (Key angles, phases).
    -   *Optional*: Reference comparison data.
3.  **Processing**:
    -   Construct prompt with context and metrics.
    -   Call LLM to generate structured feedback (Strengths, Weaknesses, Tips).
    -   *RAG (Simplified)*: LLM selects relevant drills from a provided list of "Focus Areas" or we do a vector search (future). For MVP, we can pass a summary of available drills or rely on the LLM to suggest generic drills that we map to our DB.
4.  **Output**: JSON containing text sections and list of recommended Drill IDs.
5.  **Storage**: Save result in `Analysis` model (new column `ai_feedback`) to avoid re-generation.

### Chat System
-   **Context**: The chat should be aware of the *current video* being viewed if opened from the player.
-   **Persistence**: Store chat history in PostgreSQL (`ChatSession` -> `ChatMessage`).
-   **Streaming**: Use Server-Sent Events (SSE) or simple request/response for MVP. Simple req/res is easier for now.

## Database Schema Changes

### `Analysis` (Update)
-   `ai_feedback`: JSONB (stores generated feedback and recommendations).

### `ChatSession` (New)
-   `id`: UUID
-   `user_id`: UUID
-   `title`: String
-   `created_at`: DateTime

### `ChatMessage` (New)
-   `id`: UUID
-   `session_id`: UUID
-   `role`: String ('user', 'assistant')
-   `content`: Text
-   `created_at`: DateTime

## API Design

### `POST /api/v1/analysis/{id}/feedback`
-   **Returns**: `{ feedback: { strengths: [], weaknesses: [], tips: [] }, recommendations: [drill_id, ...] }`

### `POST /api/v1/chat/message`
-   **Body**: `{ session_id: UUID, message: "..." }`
-   **Returns**: `{ message: "..." }`
