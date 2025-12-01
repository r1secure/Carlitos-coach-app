# Add Navigation Buttons to Admin KB Pages

## Goal
Add a "Back to Dashboard" button on all Admin Knowledge Base sub-pages to improve navigation.

## Context
Currently, once an admin navigates to a specific section (e.g., Drills), there is no easy way to go back to the main Knowledge Base dashboard (`/admin/knowledge-base`) without using the browser's back button or the main sidebar.

## Changes

### Frontend
- Update the following pages to include a "Back" button at the top:
    - `frontend/src/app/admin/knowledge-base/drills/page.tsx`
    - `frontend/src/app/admin/knowledge-base/exercises/page.tsx`
    - `frontend/src/app/admin/knowledge-base/tips/page.tsx`
    - `frontend/src/app/admin/knowledge-base/programs/page.tsx`
    - `frontend/src/app/admin/knowledge-base/references/page.tsx`

## Risks
- None. Purely UI change.
