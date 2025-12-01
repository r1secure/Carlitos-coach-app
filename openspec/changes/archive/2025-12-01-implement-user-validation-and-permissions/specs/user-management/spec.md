# User Management Spec Delta

## ADDED Requirements

### Requirement: User Validation Process
The system MUST implement a validation process for new users.

#### Scenario: New User Registration
Given a new user registers
When they submit the registration form
Then their account is created with status "PENDING"
And they are redirected to a "Pending Approval" page
And they cannot access the main dashboard

#### Scenario: Admin Approves User
Given a user with status "PENDING"
When an Admin clicks "Approve" in the User Management interface
Then the user's status changes to "APPROVED"
And the user can access the dashboard upon next login

### Requirement: Fine-Grained Permissions
The system MUST support fine-grained permissions for users.

#### Scenario: Default Permissions
Given a user is approved
When they are assigned the "PLAYER" role
Then they receive default permissions: "view_knowledge_base", "upload_videos", "use_virtual_coach"

#### Scenario: Admin Revokes Permission
Given a user has "use_virtual_coach" permission
When an Admin unchecks "Virtual Coach" in the user details
Then the user can no longer access the Virtual Coach feature
And the Virtual Coach UI elements are hidden or disabled for that user
