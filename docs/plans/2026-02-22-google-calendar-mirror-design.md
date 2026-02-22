# Google Calendar Mirror + Notification Execution Layer Design

Date: 2026-02-22
PRD: PRD-04
Version: 1.0

## Overview
This design mirrors approved LifeOS plans into Google Calendar events with structured reminders so Android devices trigger execution alerts. LifeOS remains the source of truth; calendar is a mirror only.

## Goals
- Server-side Google OAuth 2.0 integration.
- User-selectable calendar.
- Idempotent plan-to-calendar sync with diffing.
- Reminder policy engine for block types.
- Persist block-to-event mappings.
- Sync status visibility and error logging.

## Non-Goals
- Two-way sync or calendar edits altering plans.
- Multiple calendars per user (v1 single selected calendar).

## Architecture
Sync flow:
1. User connects Google account via OAuth.
2. Store encrypted refresh token server-side.
3. User selects calendar from their account.
4. After plan activation, trigger `/v1/calendar/:plan_id/sync`.
5. Compute diff between plan blocks and existing mapped events.
6. Create/update/delete events to mirror plan.
7. Persist mappings and sync status.

Idempotency:
- Stable hash of `block_id + start + end + primary task`.
- Repeated sync calls never duplicate events.

## Data Model Changes
New table: `calendar_syncs`
- id uuid pk
- plan_id uuid fk
- calendar_id text
- mapping jsonb (block_id, gcal_event_id, last_synced_hash)
- sync_status text
- last_sync_at timestamptz
- errors jsonb
- created_at timestamptz

Profile updates:
- `google_refresh_token` (encrypted)
- `google_calendar_id` (selected calendar)

Encryption:
- Refresh tokens encrypted at rest using server env key (`GCAL_TOKEN_ENC_KEY`).

## OAuth & Token Handling
- Scope: `https://www.googleapis.com/auth/calendar`.
- Refresh handling via Google OAuth library.
- On refresh failure, prompt re-auth in dashboard.

## Calendar Event Contract
Required fields:
- summary, description, start, end, reminders

Formats:
- Summary: `[LifeOS] {BlockType}: {PrimaryTaskTitle}`
- Description: rationale.why + tradeoff + fallback + plan_id + block_id
- Start/End: ISO 8601 with timezone
- Visibility: private

## Reminder Policy Engine
- Default: 10 minutes
- Overrides:
  - sleep: 30
  - deep_work: 10
  - training: 20
  - meal: 5
- Type: popup

## API Endpoints
- `GET /v1/calendar/connect`: initiate OAuth flow.
- `GET /v1/calendar/oauth/callback`: OAuth callback.
- `POST /v1/calendar/:plan_id/sync`: mirror plan to calendar.

## Sync Logic
Diff algorithm:
- Fetch existing mapped events.
- Compare block_id + hash.
- Create if no mapping.
- Update if hash changed.
- Delete if block removed.

## Dashboard Requirements
- Calendar connection status.
- Selected calendar display.
- Manual sync button.
- Last sync timestamp.
- Per-plan sync status badge.
- Error display panel.

## Error Handling
- OAuth invalid: prompt reauth.
- Sync failure: set status ERROR and store errors.
- Timezone mismatch: enforce ISO timezone from plan.

## Testing Strategy
- Unit tests for hash stability and diff logic.
- Integration test for event create/update/delete idempotency.
- OAuth flow smoke test (manual).
