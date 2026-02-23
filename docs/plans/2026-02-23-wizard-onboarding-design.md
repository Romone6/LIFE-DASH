# Wizard Onboarding (No-DB-Preseed)

Date: 2026-02-23

## Objective
Provide a first-run wizard so users can generate plans without any pre-existing DB data. The wizard captures profile, goals, and commitments, generates Plan A/B/C, previews the plan, and activates it.

## UX Flow
- Wizard overlays the dashboard when no profile exists (or when user manually opens it).
- Steps:
  1) Profile
  2) Goals
  3) Commitments
  4) Generate & Preview
- Wizard closes after confirmation and sets `localStorage.lifeos_wizard_complete = true`.

## Data Model
Wizard state mirrors existing API contracts:
- `profile.sleep_window`: `{ start, end, hard_flag }`
- `profile.preferences`: `{ aggression_level, deep_work_preference, meal_count }`
- `profile.non_negotiables`: `string[]`
- `goals[]`: `{ id, title, priority_weight, deadline_date, success_metric }`
- `commitments[]`: `{ id, title, start_at, end_at, recurrence_rule, hard_flag }`

## API Integration
- `POST /v1/profile/upsert` with wizard payload
- `POST /v1/plans/:date/generate`
- `GET /v1/plans/:date?mode=A|B|C` for preview toggle
- Confirmation does not create additional data; it simply dismisses wizard.

## Validation
- Step 1 requires sleep window + meal count
- Step 2 requires at least one complete goal
- Step 3 is optional unless user adds rows
- Step 4 blocks on API errors; provide retry + edit

## UI Components
- `WizardOverlay` (modal with stepper)
- `StepProfile`
- `StepGoals`
- `StepCommitments`
- `StepPreview`

## Error Handling
- Inline validation errors block “Next”.
- API errors show a blocking panel with retry.

## Testing
- Add a minimal UI render test for wizard presence.
- Use existing endpoint tests for API behavior.

## Implementation Notes
- Insert into `apps/web/src/app/page.tsx` for initial pass.
- Keep wizard state local; avoid extra endpoints.
