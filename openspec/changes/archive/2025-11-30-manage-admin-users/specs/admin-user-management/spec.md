# Spec Delta: Admin User Management

## ADDED Requirements

### Requirement: User Administration
The system MUST allow Administrators to view and manage all registered users.

#### Scenario: Admin lists users
Given I am an authenticated Administrator
When I access the user management page
Then I should see a list of all registered users
And I should be able to filter them by name, email, or role.

#### Scenario: Admin updates user role
Given I am an authenticated Administrator
When I change a user's role from "Player" to "Coach"
Then the user's permissions should be updated immediately.

#### Scenario: Admin deactivates user
Given I am an authenticated Administrator
When I set a user's status to "Inactive"
Then the user should no longer be able to log in.

#### Scenario: Access Control
Given I am a "Player" or "Coach"
When I attempt to access the user management endpoints
Then I should receive a 403 Forbidden error.
