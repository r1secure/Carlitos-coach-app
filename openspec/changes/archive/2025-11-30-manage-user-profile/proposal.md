# Manage User Profile

## Why
Enable users (players) to manage their personal and tennis-specific profile information, including name, birth date, ranking, club, and play style.

## Context
Currently, the user profile only contains basic authentication info (email, full name, avatar). To provide a personalized coaching experience, we need to capture more specific details about the player's tennis identity.

## What Changes
1.  **Backend**:
    -   Extend the `User` model to include:
        -   `first_name`, `last_name` (Nom, Prénom)
        -   `birth_date`
        -   `ranking` (Classement)
        -   `fft_club`
        -   `tenup_profile_url`
        -   `handedness` (Droitier/Gaucher)
        -   `backhand_style` (Revers 1 main/2 mains)
        -   `play_style`
    -   Update `GET /api/v1/users/me` to return these fields.
    -   Add/Update `PUT /api/v1/users/me` (or specific profile endpoint) to allow updates.

2.  **Frontend**:
    -   Create a "Profile" or "Settings" page in the dashboard.
    -   Implement a form to edit these fields with appropriate validation.

## Risks
-   **Data Migration**: Existing users will have null values for new fields. The UI must handle this gracefully.
-   **Privacy**: Birth date and other personal info should be treated with care (though this is a personal coaching app).

## Out of Scope
-   History of ranking changes (tracking progress over time is a separate feature).
-   Verification of FFT license or Tenup URL.
