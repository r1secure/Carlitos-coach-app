# Tasks: Implement Virtual Coach

- [x] **1. Backend: LLM Service & Feedback**
    - [x] Install `litellm`.
    - [x] Create `backend/services/llm_service.py`.
    - [x] Define System Prompt for Tennis Coach.
    - [x] Implement `generate_analysis_feedback(analysis_data)`.
    - [x] Create API endpoint `POST /api/v1/analysis/{id}/feedback`.

- [x] **2. Backend: Recommendation Engine**
    - [x] Implement logic to map analysis issues to KB Drills (RAG or simple mapping).
    - [x] Update feedback endpoint to include recommended drill IDs.

- [x] **3. Backend: Chat System**
    - [x] Create `ChatSession` and `ChatMessage` models.
    - [x] Implement `POST /api/v1/chat/message` with context awareness.
    - [x] Implement `GET /api/v1/chat/history`.

- [x] **4. Frontend: Feedback UI**
    - [x] Update `VideoPlayer` to fetch and display AI Feedback.
    - [x] Display Recommended Drills cards below feedback.

- [x] **5. Frontend: Chat UI**
    - [x] Create `ChatWidget` component.
    - [x] Integrate Chat into Dashboard or Video Player.

- [ ] **6. Verification**
    - [ ] Verify feedback generation on sample video.
    - [ ] Verify chat interaction and context retention.
