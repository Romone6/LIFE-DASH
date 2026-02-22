# Core Planning Engine + Compiler (System Backbone) Design

Date: 2026-02-22
PRD: PRD-01
Version: 1.0

## Overview
This design specifies the LifeOS server-side planning engine that converts user inputs into Plan A/B/C JSON programs that are deterministic, validated, auditable, and storable. The system uses a server-side AI gateway (OpenRouter), strict JSON Schema validation, a repair loop, and integrity checks before persisting any plan.

## Goals
- Deterministically compile user inputs into valid Plan A/B/C JSON.
- Enforce JSON Schema and basic feasibility/integrity constraints.
- Persist only valid, auditable plans in Supabase Postgres.
- Expose a minimal API for profile upsert, plan generation/fetch, and event logging.
- Provide minimal web (Next.js) and mobile (Expo) clients to display plan blocks.

## Non-Goals
- Health Connect ingestion, Google Calendar sync, evidence engine.
- Auditor agent, 3D/holographic systems, learning loop optimization.
- Banking connectors.

## Monorepo Layout
- `apps/server`: Fastify + TypeScript API (AI gateway, compiler, validation, persistence).
- `apps/web`: Next.js client (minimal plan viewer).
- `apps/mobile`: Expo client (minimal plan viewer).
- `packages/schema`: JSON Schema definitions + types.
- `packages/shared`: shared utilities (hashing, time helpers).

## Core Data Model (Supabase Postgres)
Tables:
- `profiles`: user preferences and non-negotiables.
- `goals`: user goals with priorities and deadlines.
- `commitments`: fixed obligations (including recurrence and hard_flag).
- `plans`: plan JSON per user/date/mode with metadata.
- `plan_events`: execution and daily review logs.
- `ai_runs`: AI call metadata (model_id, prompt_version, input_hash, output_hash, cost_estimate, status).

Notes:
- `plans.plan_json` is JSONB with full Plan content.
- Unique index on `(user_id, date_local, mode)`.
- Use ISO 8601 timestamps with timezone offsets in plan JSON.

## Plan JSON Requirements
Must include:
- plan_id, user_id, date_local, timezone, schema_version, mode
- profile_snapshot, commitments, blocks, contingencies
- rationale_per_block, integrity_report_stub

Must enforce:
- No overlapping time blocks
- Sleep window preserved
- Commitments untouched
- Default 10-minute buffers between blocks
- Plan C must exist

## AI Call Flow
1. Load profile, goals, commitments for date.
2. Construct structured planner prompt with fixed `prompt_version`.
3. Call OpenRouter (server-only) with model `arcee-ai/trinity-large-preview:free`.
4. Require structured JSON output only.
5. Validate against JSON Schema.
6. If invalid, repair loop (max 2 attempts) with error feedback.
7. Run integrity checks.
8. Persist plan only if valid.

Failure policy:
- If still invalid after repair: return structured error, do not persist.

## Validation & Integrity Checks
Schema validation:
- Ajv strict validation with all errors surfaced.

Integrity checks:
- No overlaps between blocks.
- Commitments unchanged in schedule and time.
- Sleep window preserved as hard constraint.
- Buffers (10 minutes) between blocks unless prevented by commitments.
- Plan C existence for the date.

## API Endpoints
- `POST /v1/profile/upsert`: upsert profile, goals, commitments.
- `POST /v1/plans/:date/generate`: generate Plan A/B/C and persist if valid.
- `GET /v1/plans/:date`: fetch stored plan for date.
- `POST /v1/plans/:plan_id/events`: log execution events.

Auth (MVP):
- Trusted `x-user-id` header enforced by server.

## Error Handling
- Invalid schema: `400` with validation error details.
- Integrity failure: `422` with structured error details.
- OpenRouter failure: `502`.
- Persistence failure: `500`.

## Testing Strategy
- TDD for compiler: schema validation and integrity checks.
- Unit tests for repair loop and deterministic hashing.
- Minimal integration test for `/v1/plans/:date/generate`.

## Open Questions
- How to estimate cost for OpenRouter calls (best-effort or N/A for free model)?
- What minimal UI fields are needed for the first plan viewer?
