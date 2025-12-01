# Design: User Validation & Permissions

## Data Model

### User Status
We will introduce a `validation_status` Enum:
- `PENDING`: Registered but not validated.
- `APPROVED`: Validated by admin.
- `REJECTED`: Denied access.

The existing `is_active` flag can be used for soft-deletion or temporary suspension, while `validation_status` tracks the onboarding workflow.
*Decision*: Use `validation_status` column.

### Permissions
We will use a JSONB column `permissions` on the `User` table for flexibility and simplicity (avoiding a complex many-to-many table for simple feature flags).

Structure:
```json
{
  "can_view_knowledge_base": true,
  "can_upload_videos": true,
  "can_use_virtual_coach": false
}
```

Defaults will be applied based on `UserRole` during registration or approval.

## Security
- **API Level**: Create a dependency `check_permission(permission_name)` to use in API routes.
- **Frontend Level**: `useAuth` hook will expose `user.permissions`.

## UX Flow
1. **Registration**: User signs up -> Redirected to "Registration Successful, waiting for approval".
2. **Login (Pending)**: User logs in -> Redirected to "Account Pending" page. No access to dashboard.
3. **Admin**:
   - Sees badge on "Users" tab for pending requests.
   - Clicks "Approve" -> User status becomes `APPROVED`.
   - Edits user -> Toggles specific permissions.
