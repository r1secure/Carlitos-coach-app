# Standardize Admin Users Back Button

## Goal
Update the "Back to Dashboard" button on the Admin Users page (`/admin/users`) to match the style of other admin pages.

## Context
The user requested that the back button on `/admin/users` be consistent with the rest of the admin interface (ghost variant with arrow icon), replacing the current blue button.

## Changes

### Frontend
- Update `frontend/src/app/admin/users/page.tsx`:
    - Change `<Button onClick={() => router.push('/dashboard')}>Retour au Dashboard</Button>` to:
      ```tsx
      <Link href="/dashboard">
          <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au tableau de bord
          </Button>
      </Link>
      ```
    - Import `Link` from `next/link` and `ArrowLeft` from `lucide-react`.

## Risks
- None.
