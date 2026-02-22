# System Stability Governor — Burnout & Overreach Prevention Layer Design

Date: 2026-02-22
PRD: PRD-10
Version: 1.0

## Overview
This design introduces a Stability Governor that monitors physiological signals, workload intensity, adherence volatility, and audit risk patterns to prevent burnout, injury, or cognitive overload. It runs daily via server cron and can override planning when risk is high.

## Goals
- Daily risk scoring (burnout, injury, cognitive overload).
- Deterministic intervention logic.
- Stability Plan generation for critical risk.
- Transparent override logging.
- Dashboard stability panel.

## Non-Goals
- Medical diagnosis or clinician alerts.

## Architecture & Flow
- Daily scheduled job inside Fastify (server cron).
- Computes risk scores (0–100) and zone (Stable/Elevated/High/Critical).
- Persists `governor_state` per user.
- Interventions applied based on zone.
- Planner consumes governor state as input.
- Auditor verifies governor constraints.

## Risk Scoring
Burnout inputs:
- sleep_deficit_trend
- deep_work_density
- missed_recovery_blocks
- energy_self_report

Injury inputs:
- training_volume_trend
- sleep_quality
- exercise_session_density

Cognitive overload inputs:
- consecutive_high_effort_blocks
- audit_schedule_realism_score
- adherence_instability

Zones:
- 0–40 Stable
- 41–65 Elevated
- 66–85 High
- 86–100 Critical

## Interventions
Elevated:
- Reduce next day workload by 10%
- Insert additional recovery buffer

High:
- Convert Plan A to Plan B
- Reduce high-effort blocks
- Block new experiments

Critical:
- Override planner output
- Generate Stability Plan (recovery-first)
- Lock aggressive scheduling

## Stability Plan
Focus:
- Sleep protection
- Reduced intensity
- Active recovery
- Low cognitive load
Duration: 2 days default

## Override Rules
- All interventions logged.
- User may override with confirmation + reason.
- Repeated overrides increase risk weighting.

## Data Model Changes
New table: `governor_state`
- id uuid pk
- user_id uuid
- burnout_score int
- injury_score int
- cognitive_score int
- zone text
- intervention_active boolean
- last_updated timestamptz

## UI Requirements
Stability Panel:
- Current risk zone indicator
- Trend sparkline
- Intervention history
- Override button with warning

Visual behavior:
- Amber glow for Elevated
- Crimson pulse for Critical

## Testing Strategy
- Unit tests for scoring and zone classification.
- Integration tests for intervention application.
- Override logging tests.
