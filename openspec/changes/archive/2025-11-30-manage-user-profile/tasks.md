# Tasks: Manage User Profile

## Backend
- [x] Create migration to add profile fields to `users` table (`first_name`, `last_name`, `birth_date`, `ranking`, `fft_club`, `tenup_profile_url`, `handedness`, `backhand_style`, `play_style`).
- [x] Update `User` SQLAlchemy model in `backend/models/user.py`.
- [x] Update Pydantic schemas in `backend/schemas/user.py` (Create `UserUpdate` and extend `UserResponse`).
- [x] Update `backend/routes/users.py` (or `auth.py` if `users.py` doesn't exist) to handle profile updates.

## Frontend
- [x] Create `ProfilePage` component at `frontend/src/app/dashboard/profile/page.tsx`.
- [x] Implement profile edit form with validation (Zod schema).
- [x] Connect form to `PUT /api/v1/users/me`.
- [x] Add navigation link to Profile in the dashboard sidebar/header.

## Verification
- [x] Verify database schema changes.
- [x] Test API endpoints with Swagger UI.
- [x] Verify UI form submission and data persistence.
