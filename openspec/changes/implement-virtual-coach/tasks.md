# Tasks: Implement Virtual Coach

- [ ] **1. Backend: LLM Service & Feedback**
    - [ ] Install `litellm`.
    - [ ] Create `backend/services/llm_service.py`.
    - [ ] Define System Prompt for Tennis Coach.
    - [ ] Implement `generate_analysis_feedback(analysis_data)`.
    - [ ] Create API endpoint `POST /api/v1/analysis/{id}/feedback`.

- [ ] **2. Backend: Recommendation Engine**
    - [ ] Implement logic to map analysis issues to KB Drills (RAG or simple mapping).
    - [ ] Update feedback endpoint to include recommended drill IDs.

- [ ] **3. Backend: Chat System**
    - [ ] Create `ChatSession` and `ChatMessage` models.
    - [ ] Implement `POST /api/v1/chat/message` with context awareness.
    - [ ] Implement `GET /api/v1/chat/history`.

- [ ] **4. Frontend: Feedback UI**
    - [ ] Update `VideoPlayer` to fetch and display AI Feedback.
    - [ ] Display Recommended Drills cards below feedback.

- [ ] **5. Frontend: Chat UI**
    - [ ] Create `ChatWidget` component.
    - [ ] Integrate Chat into Dashboard or Video Player.

- [ ] **6. Verification**
    - [ ] Verify feedback generation on sample video.
    - [ ] Verify chat interaction and context retention.
