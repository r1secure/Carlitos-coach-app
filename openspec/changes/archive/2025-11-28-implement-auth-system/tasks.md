# Implementation Tasks

## 1. Backend Implementation

- [x] 1.1 Database Schema
    - [x] Create `User` model and migration
    - [x] Add `role` enum type

- [x] 1.2 Auth Service & Utilities
    - [x] Install `python-jose`, `passlib`, `httpx`
    - [x] Configure Google OAuth credentials (env vars)
    - [x] Implement JWT generation and verification logic
    - [x] Implement Google ID token verification

- [x] 1.3 Auth Endpoints
    - [x] `POST /api/v1/auth/login/google`: Exchange code for tokens
    - [x] `POST /api/v1/auth/refresh`: Refresh access token
    - [x] `GET /api/v1/users/me`: Get current user profile

- [x] 1.4 RBAC Middleware
    - [x] Create `get_current_user` dependency
    - [x] Create `get_current_active_user` dependency
    - [x] Create role-based dependencies (e.g., `get_admin_user`)

## 2. Frontend Implementation

- [x] 2.1 Auth Setup
    - [x] Install `next-auth` or custom auth hooks (decided on custom hooks per design)
    - [x] Create `AuthContext` for global user state

- [x] 2.2 Login Page
    - [x] Create `/login` page
    - [x] Add "Sign in with Google" button
    - [x] Handle OAuth callback at `/auth/callback`

- [x] 2.3 Protected Routes
    - [x] Create `ProtectedRoute` component
    - [x] Implement redirect logic for unauthenticated users

- [x] 2.4 API Integration
    - [x] Create `apiClient` interceptor for auto-attaching tokens
    - [x] Implement auto-refresh logic on 401 response

## 3. Testing & Validation

- [x] 3.1 Backend Tests
    - [x] Test JWT generation/validation
    - [x] Test RBAC dependencies

- [x] 3.2 Manual Verification
    - [x] Verify Google Login flow
    - [x] Verify access control on protected routes
