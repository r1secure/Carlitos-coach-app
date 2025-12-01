# Implement Authentication System

## Summary
Implement a complete authentication and authorization system using OAuth 2.0 (Google) and JWT. This includes backend support for user management and RBAC, and frontend integration for login and protected routes.

## Motivation
To support the "Player Space" and "Coach Space" features, the application needs a secure way to identify users and control access to resources.

## Proposed Changes
1.  **Backend Authentication**:
    *   Implement Google OAuth 2.0 flow.
    *   Create JWT token issuance (Access & Refresh tokens).
    *   Implement RBAC middleware (Admin, Coach, Player).
2.  **User Management**:
    *   Create `users` table and models.
    *   Implement user profile endpoints.
3.  **Frontend Authentication**:
    *   Create Login page.
    *   Implement Auth Context/Provider.
    *   Create Protected Route wrappers.
    *   Handle token refresh logic.
