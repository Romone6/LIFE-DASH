# Android Kotlin App + Health Connect Signal Sync Design

Date: 2026-02-22
PRD: PRD-03
Version: 1.0

## Overview
This design replaces the Expo app with a native Android Kotlin application that reads Health Connect data and syncs daily SignalSnapshot JSON to the LifeOS backend. Android serves as the sensor bridge; the server remains the brain.

## Goals
- Integrate Health Connect SDK with granular permissions.
- Read sleep, activity, and nutrition data.
- Build daily SignalSnapshot JSON with provenance and confidence.
- Compute 7-day rolling baselines client-side.
- Upload snapshots to backend with Supabase JWT auth.
- Provide minimal Compose UI for permissions and sync.

## Non-Goals
- Medical diagnosis, real-time streaming, advanced biometrics.

## Architecture
Pattern: MVVM (ViewModel + Repository)

Modules:
- `healthconnect`: HcClient, HcPermissions, SleepReader, ActivityReader, NutritionReader
- `sync`: SignalSnapshotBuilder, SyncRepository
- `api`: Supabase client + backend API client
- `auth`: Supabase Auth (email/password)
- `ui`: Compose screens

App location:
- `apps/android`

## Health Connect Integration
Required record types:
- `SleepSessionRecord`
- `StepsRecord`
- `ExerciseSessionRecord` (if available)
- `TotalCaloriesBurnedRecord` (optional)
- `NutritionRecord`

Permissions flow:
1. Explanation screen.
2. Granular permission request.
3. Handle denial gracefully.
4. Allow re-request via settings.

Notes:
- Default read window may be limited to ~30 days post-grant.

## SignalSnapshot Schema
Required fields:
- snapshot_id, user_id, date_local, timezone, generated_at
- sleep, activity, nutrition
- provenance, confidence
- baseline (7-day rolling)

Sleep:
- duration_minutes, start_time, end_time
- sleep_stage_breakdown (optional)

Activity:
- steps_total
- exercise_sessions (optional)
- calories_burned (optional)

Nutrition:
- calories_total, protein_grams, carbs_grams, fat_grams
- micronutrients (optional)

Provenance:
- data_source, timestamp_collected, missing_fields

Confidence logic:
- Missing sleep reduces confidence.
- Incomplete nutrition yields medium confidence.
- Missing steps degrades activity reliability.

Baseline:
- 7-day rolling averages: sleep, steps, protein, calories.
- If insufficient data, mark baseline confidence low.

## Sync Flow
Triggers:
- Manual “Sync Now” button.
- App open.

Process:
1. Read Health Connect signals for local date.
2. Build SignalSnapshot.
3. Compute baselines locally (Room cache).
4. Upload to server `/v1/healthconnect/snapshots`.

Auth:
- Supabase Auth email/password.
- Include `Authorization: Bearer <jwt>`.

## Error Handling
- Permission denied: app continues with reduced confidence.
- No data: send snapshot with missing_fields populated.
- Network failure: exponential backoff with capped retries.

## UI Screens (Compose)
- PermissionsScreen: explanation + request.
- TodayScreen: summary + last sync timestamp.
- SyncScreen: status indicator + “Sync Now”.

## Testing Strategy
- Unit tests for SignalSnapshotBuilder and confidence logic.
- Repository tests with mocked Health Connect data.
- Basic UI tests for permission flow.

## Open Questions
- Should baseline calculations optionally fetch from server in v1.1?
- Which local storage (Room vs DataStore) for snapshots/baselines?
