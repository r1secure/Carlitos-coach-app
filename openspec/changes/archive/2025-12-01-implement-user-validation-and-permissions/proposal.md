# Proposal: Implement User Validation and Fine-Grained Permissions

## Why
Currently, new users are automatically active upon registration (implied by `is_active=True` default or lack of validation flow). There is no mechanism to vet new users before they access the platform. Additionally, access control is coarse-grained (Role-Based: Admin vs Player), but we need finer control over specific features like Knowledge Base access, Video Upload, and Virtual Coach usage per user.

## What Changes

### User Validation Workflow
- **New Users**: Default to `status="PENDING"` (or `is_active=False` with a specific status flag).
- **Admin Validation**: Admins can view pending users and Approve or Reject them.
- **Notifications**: Notify users upon approval (email or UI feedback).

### Fine-Grained Permissions
- **Permission Model**: Introduce a `UserPermission` model or a JSONB column `permissions` on the `User` table to store specific feature flags.
- **Granular Flags**:
    - `can_view_knowledge_base`
    - `can_upload_videos`
    - `can_use_virtual_coach`
    - `can_manage_users` (Admin only)
- **Default Permissions**: Define default permission sets for roles (Player, Coach, Admin).

### UI Updates
- **Admin Dashboard**:
    - "Pending Users" queue.
    - User Detail view with toggles for each permission.
- **User Experience**:
    - "Account Pending" screen for unvalidated users.
    - Feature guards in the UI (hide/disable buttons based on permissions).

## Verification Plan
### Automated Tests
- Unit tests for `User` model updates and permission checks.
- API tests for Admin validation endpoints.

### Manual Verification
- Register a new user -> Verify "Pending" state.
- Admin approves user -> Verify access.
- Admin toggles "Virtual Coach" permission -> Verify user loses/gains access.
