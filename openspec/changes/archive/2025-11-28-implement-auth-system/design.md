# Authentication System Design

## Architecture

### 1. Authentication Flow (OAuth 2.0 + JWT)
We will use a standard OAuth 2.0 Authorization Code flow with Google as the provider.

1.  **Frontend**: Redirects user to Google Login URL.
2.  **Google**: User authenticates and consents. Google redirects back to Frontend with `code`.
3.  **Frontend**: Sends `code` to Backend `/api/v1/auth/google/callback`.
4.  **Backend**:
    *   Exchanges `code` for Google ID Token.
    *   Verifies ID Token.
    *   Finds or Creates User in DB based on email.
    *   Generates internal Access Token (short-lived, 15m) and Refresh Token (long-lived, 7d).
    *   Returns tokens to Frontend.

### 2. Token Management
*   **Access Token**: JWT containing `sub` (user_id), `role`, and `exp`. Sent in `Authorization: Bearer <token>` header.
*   **Refresh Token**: Opaque string or JWT stored securely (HttpOnly cookie recommended, or secure storage). Used to obtain new Access Tokens.

### 3. Role-Based Access Control (RBAC)
*   **Roles**: `admin`, `coach`, `player`.
*   **Middleware**: A FastAPI dependency `get_current_user` will validate the JWT.
*   **Permission Check**: Additional dependencies like `require_role('admin')` will enforce access control on specific endpoints.

### 4. Database Schema
**Users Table**:
*   `id`: UUID (PK)
*   `email`: String (Unique, Indexed)
*   `full_name`: String
*   `avatar_url`: String
*   `role`: Enum ('admin', 'coach', 'player')
*   `is_active`: Boolean
*   `created_at`: Timestamp
*   `last_login`: Timestamp

## Security Considerations
*   **HTTPS**: Mandatory for all auth traffic.
*   **Token Storage**: Frontend should store Access Token in memory (or short-lived storage) and Refresh Token in HttpOnly cookie to prevent XSS.
*   **Validation**: Strict validation of Google ID tokens.
