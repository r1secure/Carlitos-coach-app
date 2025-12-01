# Implement Virtual Coach Features

## Goal
Implement the "Virtual Coach" intelligence to provide automated, personalized feedback to players based on video analysis, and enable interactive coaching via chat.

## Context
We have successfully implemented the video analysis pipeline which generates raw metrics (angles, keypoints). The next step is to interpret these metrics to give actionable advice, mimicking a human coach.

## Changes

### Backend
- **LLM Service (`backend/services/llm_service.py`)**:
    - Integration with LiteLLM (supporting Gemini Pro/Flash).
    - Prompt management for "Tennis Coach" persona.
    - Functions to generate feedback from analysis JSON.
    - Functions to recommend drills based on detected issues.
- **Chat Service**:
    - Logic to handle chat history and context.
- **API Routes**:
    - `POST /api/v1/analysis/{id}/feedback`: Generate/retrieve textual feedback.
    - `POST /api/v1/chat/message`: Send a message to the AI coach.
    - `GET /api/v1/chat/history`: Retrieve chat history.
- **Database Models**:
    - `Feedback` (linked to Analysis/Video).
    - `ChatSession` and `ChatMessage`.

### Frontend
- **Video Player Page**:
    - Display AI Feedback section (textual advice).
    - Display Recommended Drills (linked to KB).
- **Chat Interface**:
    - Floating chat widget or dedicated "Coach" page.
    - Chat UI with message bubbles and typing indicators.

## Risks
- **LLM Cost/Latency**: Generating feedback might be slow or costly. We should cache results.
- **Hallucinations**: The AI might give wrong tennis advice. We need robust system prompts and potentially RAG (Retrieval-Augmented Generation) using our Knowledge Base.
