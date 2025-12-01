# Tasks: Manage Admin Users

## Backend
- [x] Create `UserAdminUpdate` schema in `backend/schemas/user.py`.
- [x] Add `GET /api/v1/users` endpoint in `backend/routes/users.py` (Admin only).
- [x] Add `PUT /api/v1/users/{user_id}` endpoint in `backend/routes/users.py` (Admin only).
- [x] Ensure `UserResponse` includes necessary fields (role, is_active).

## Frontend
- [x] Create `frontend/src/app/admin/users/page.tsx`.
- [x] Implement `UsersTable` component with search and pagination.
- [x] Implement `EditUserDialog` for updating role and status.
- [x] Add navigation link to `/admin/users` in the Dashboard Admin card.

## Verification
- [x] Verify Admin can list all users.
- [x] Verify Admin can search users by name/email.
- [x] Verify Admin can change a user's role (e.g., Player -> Coach).
- [x] Verify Admin can deactivate a user.
- [x] Verify non-admin users cannot access these endpoints.
