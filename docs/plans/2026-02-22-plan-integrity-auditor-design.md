# Plan Integrity Engine + Adversarial Auditor Agent Design

Date: 2026-02-22
PRD: PRD-02
Version: 1.0

## Overview
This design introduces a deterministic integrity engine and adversarial AI auditor that validate, stress-test, and approve plans before activation. Plans are only activatable after passing deterministic rules and an audit PASS or PASS_WITH_WARNINGS. Audit FAIL triggers regeneration up to a strict limit.

## Goals
- Enforce hard, deterministic integrity rules prior to any AI audit.
- Run adversarial AI auditing with structured outputs and schema validation.
- Block activation on audit FAIL, allow PASS_WITH_WARNINGS without override.
- Persist audit reports with risk register for dashboard visibility.
- Regenerate plans when audits fail, max 2 attempts.

## Non-Goals
- Evidence engine, health signals, calendar mirroring, learning optimization.

## Architecture
Validation layers:
1. **Deterministic Integrity Engine** (non-AI hard rules)
2. **Adversarial Auditor Agent** (AI reasoning via OpenRouter)

Activation flow:
1. Planner generates Plan JSON.
2. Deterministic integrity validation runs.
3. If pass, send to Auditor.
4. Auditor returns `audit_report` JSON.
5. If status=PASS or PASS_WITH_WARNINGS, plan becomes activatable.
6. If status=FAIL, regenerate (max 2 attempts).

## Deterministic Integrity Rules
Time rules:
- No overlapping blocks.
- Minimum 10-minute buffer between blocks.
- Sleep window strictly preserved.
- Commitments immutable.
- Total scheduled time <= 16 waking hours.

Intensity rules:
- No more than 3 high-effort blocks consecutively.
- No heavy physical training within 3h of sleep.
- No deep work block < 30 minutes.
- Plan C workload <= 60% of Plan A.

Stability rules:
- Max 25% schedule change during regeneration unless user override.
- Completed blocks cannot be modified.
- Hard constraints cannot be downgraded.

## Audit Report Schema
Required fields:
- audit_id
- plan_id
- status (PASS, PASS_WITH_WARNINGS, FAIL)
- severity (LOW, MEDIUM, HIGH, CRITICAL)
- errors
- warnings
- risk_register
- suggested_fixes
- auditor_model_info

Risk register dimensions:
- burnout_risk
- injury_risk
- deadline_risk
- schedule_realism_risk
Scores are normalized 0-100.

## Data Model Changes
New table: `audit_reports`
Columns:
- id uuid pk
- plan_id uuid fk
- status text
- severity text
- errors jsonb
- warnings jsonb
- risk_register jsonb
- suggested_fixes jsonb
- model_id text
- created_at timestamptz

Recommended plan activation fields in `plans`:
- audit_status text
- is_active boolean
- activated_at timestamptz
- activated_by text (system or human_override)

## AI Auditor Prompt Contract
Role: Adversarial Planning Auditor
Instructions:
- Analyze provided Plan JSON.
- Detect unrealistic workload stacking.
- Detect sleep erosion risk.
- Detect energy distribution imbalances.
- Evaluate goal allocation fairness.
- Return structured JSON audit report only.

## API Changes
- `POST /v1/audit/:plan_id/run`: Run auditor manually.
- `POST /v1/plans/:date/generate`: now automatically invokes auditor.

## Error Handling
- Deterministic integrity failure: `422` with rule violations.
- Audit schema invalid after repair: `400`.
- Audit FAIL after retry limit: `409` with report, not activatable.

## Dashboard Updates
- Audit status badge on plan.
- Warnings inline per block.
- Risk register summary panel.
- Block activation if audit FAIL; allow PASS_WITH_WARNINGS with banner.

## Testing Strategy
- Unit tests for each deterministic rule (TDD).
- Tests for audit schema validation and repair loop.
- Tests for regeneration retry limit and churn limiter.
- Integration test for generation + audit pipeline.

## Open Questions
- Do we want to store deterministic rule failures as separate audit records?
- Do we want PASS_WITH_WARNINGS to auto-activate for all users or configurable?
