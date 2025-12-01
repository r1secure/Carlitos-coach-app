# Design: Admin User Management

## API Design

### `GET /api/v1/users`
-   **Auth**: Requires `ADMIN` role.
-   **Params**: `skip`, `limit`, `search` (email/name), `role` (filter).
-   **Response**: List of `UserResponse` + `total` count.

### `PUT /api/v1/users/{user_id}`
-   **Auth**: Requires `ADMIN` role.
-   **Body**: `UserAdminUpdate` schema.
    ```json
    {
      "role": "coach",
      "is_active": true,
      "full_name": "..."
    }
    ```
-   **Logic**:
    -   Check if `user_id` exists.
    -   Prevent self-demotion (if `user_id == current_user.id` and `role != ADMIN`).

## Frontend Design

-   **Page**: `/admin/users/page.tsx`
-   **Components**:
    -   `UsersTable`: Displays user list.
    -   `UserActions`: Dropdown menu for Edit/Deactivate.
    -   `EditUserDialog`: Form to change role/status.
-   **Navigation**: Add "Utilisateurs" link to the Admin card in Dashboard or a dedicated Admin Sidebar.

## Security
-   Use `deps.get_current_active_superuser` or similar dependency to enforce admin access.
