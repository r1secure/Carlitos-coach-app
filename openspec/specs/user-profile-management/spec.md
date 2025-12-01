# user-profile-management Specification

## Purpose
TBD - created by archiving change manage-user-profile. Update Purpose after archive.
## Requirements
### Requirement: User Profile Data
The system MUST store the following additional information for each user:
-   First Name (Prénom)
-   Last Name (Nom)
-   Birth Date
-   Tennis Ranking (Classement)
-   FFT Club
-   Tenup Profile URL
-   Handedness (Right/Left)
-   Backhand Style (One-handed/Two-handed)
-   Play Style description

#### Scenario: User views their profile
Given I am an authenticated user
When I request my profile details
Then I should see my tennis-specific information (ranking, club, etc.) along with my basic info.

### Requirement: Profile Updates
The system MUST allow authenticated users to update their own profile information.

#### Scenario: User updates their tennis attributes
Given I am an authenticated user
When I submit updates to my profile (e.g., changing ranking from "30/1" to "30")
Then the system should save these changes
And subsequent requests for my profile should reflect the new values.

#### Scenario: User sets handedness
Given I am an authenticated user
When I select "Left" for handedness and "Two-handed" for backhand
Then these attributes should be stored correctly.

