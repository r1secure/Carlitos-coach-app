# Design: User Profile Management

## Database Schema

We will extend the existing `users` table.

### New Enums
-   `Handedness`: `RIGHT`, `LEFT`
-   `BackhandStyle`: `ONE_HANDED`, `TWO_HANDED`

### Modified Table: `users`

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `first_name` | String | Yes | Prénom |
| `last_name` | String | Yes | Nom |
| `birth_date` | Date | Yes | Date de naissance |
| `ranking` | String | Yes | Classement FFT (e.g., "30/1", "15/4") |
| `fft_club` | String | Yes | Club FFT |
| `tenup_profile_url` | String | Yes | URL vers profil Tenup |
| `handedness` | Enum | Yes | Droitier ou Gaucher |
| `backhand_style` | Enum | Yes | Revers à une ou deux mains |
| `play_style` | String | Yes | Description du style de jeu (e.g., "Attaquant de fond de court") |

*Note: `full_name` will be kept for backward compatibility or updated to be a concatenation of `first_name` + `last_name`.*

## API Design

### `GET /api/v1/users/me`
Response extended with new fields.

### `PUT /api/v1/users/me`
Request body:
```json
{
  "first_name": "Carlitos",
  "last_name": "Alcaraz",
  "birth_date": "2003-05-05",
  "ranking": "N1",
  "fft_club": "Real Club de Tenis Barcelona",
  "tenup_profile_url": "https://...",
  "handedness": "RIGHT",
  "backhand_style": "TWO_HANDED",
  "play_style": "Aggressive Baseliner"
}
```

## Frontend Design

-   **Location**: `/dashboard/profile`
-   **Components**:
    -   Profile Form using `react-hook-form` and `zod` for validation.
    -   Date picker for `birth_date`.
    -   Select inputs for Enums.
