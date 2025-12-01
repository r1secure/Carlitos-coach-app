# Tasks: Integrate Reference Videos

- [ ] **1. Backend Implementation**
    - [X] Update `knowledge_base.py`: Add `get_references` endpoint.
    - [X] Update `knowledge_base.py`: Update `search` to include references.
    - [X] Add Admin endpoint to update video reference status and metadata.

- [ ] **2. Frontend: Knowledge Base**
    - [X] Update `KnowledgeBasePage` to include 'reference' type in filters.
    - [X] Update `KnowledgeBasePage` to render reference cards.
    - [X] Ensure clicking a reference card opens the video player (or a specific page).

- [ ] **3. Frontend: Admin UI**
    - [X] Create `frontend/src/app/admin/knowledge-base/references/page.tsx`.
    - [X] Implement video list with pagination.
    - [X] Add "Is Reference" toggle.
    - [X] Add Metadata Editor dialog.

- [ ] **4. Verification**
    - [ ] Verify references appear in Knowledge Base.
    - [ ] Verify Admin can toggle reference status.
    - [ ] Verify metadata updates persist.
