# Tasks: Implement User Validation and Permissions

- [x] **1. Backend: Data Model Updates**
    - [x] Update `User` model with `status` (PENDING, ACTIVE, REJECTED) or use `is_active` with a new `validation_status` enum.
    - [x] Add `permissions` JSONB column to `User` model (or separate table).
    - [x] Create migration script.
    - [x] Update `UserSchema` to include status and permissions.

- [x] **2. Backend: API Endpoints**
    - [x] Update Registration flow to set default status to PENDING.
    - [x] Create `PUT /api/v1/admin/users/{id}/validate` endpoint (Approve/Reject).
    - [x] Create `PUT /api/v1/admin/users/{id}/permissions` endpoint.
    - [x] Update `get_current_user` dependency to check `is_active` / `status`.

- [x] **3. Frontend: Auth & Routing**
    - [x] Update `AuthContext` to handle `PENDING` status.
    - [x] Create "Account Pending" page/component.
    - [x] Redirect pending users to the pending page upon login.

- [x] **4. Frontend: Admin User Management**
    - [x] Update User List to show status (filter by Pending).
    - [x] Add "Approve" and "Reject" actions to User List.
    - [x] Create/Update User Detail view to manage Permissions (checkboxes/toggles).

- [x] **5. Frontend: Feature Guards**
    - [x] Create `PermissionGuard` component or hook (`usePermission`).
    - [x] Wrap "Upload Video", "Knowledge Base", and "Virtual Coach" features with permission checks.

- [x] **6. Verification**
    - [x] Verify registration flow (Pending state).
    - [x] Verify Admin approval flow.
    - [x] Verify permission toggling and UI updates.
