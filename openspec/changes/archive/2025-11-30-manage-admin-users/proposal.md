# Manage Admin Users

## Why
Provide an administration interface for managing users, their roles (permissions), and account status (inscriptions).

## Context
Currently, there is no UI for administrators to view or manage the user base. Managing roles (e.g., promoting a user to Coach or Admin) or deactivating accounts requires direct database access.

## What Changes
1.  **Backend**:
    -   Create `GET /api/v1/users` (Admin only) to list all users with pagination and filtering.
    -   Create `PUT /api/v1/users/{user_id}` (Admin only) to update user details, specifically `role` and `is_active`.
    -   Create `DELETE /api/v1/users/{user_id}` (Admin only) to soft-delete users (optional, or just use `is_active`).

2.  **Frontend**:
    -   Create `/admin/users` page.
    -   Display a table of users (Name, Email, Role, Status, Created At).
    -   Add actions to:
        -   Edit Role (Player, Coach, Admin).
        -   Toggle Status (Active/Inactive).
    -   Add search/filter capability.

## Risks
-   **Security**: Ensure strict RBAC checks so only `ADMIN` role can access these endpoints.
-   **Self-Lockout**: Prevent admins from demoting or deactivating themselves to avoid accidental lockout.

## Out of Scope
-   Detailed activity logs (audit trail).
-   Mass import/export of users.
