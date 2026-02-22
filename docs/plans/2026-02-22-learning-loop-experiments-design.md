# Personal Learning Loop + N-of-1 Experiment Engine Design

Date: 2026-02-22
PRD: PRD-09
Version: 1.0

## Overview
This design introduces a cautious learning loop that proposes weekly N-of-1 experiments based on adherence, outcomes, and signals. Experiments require user approval in the web dashboard before activation.

## Goals
- Track adherence + outcome metrics.
- Compute rolling baselines (7/14/30 days).
- Propose weekly experiments with user approval.
- Enforce safety caps (10% max adjustment).
- Mark experimental blocks and allow abort.

## Non-Goals
- Autonomous major lifestyle changes.
- Medical recommendations or black-box optimization.

## Architecture & Data Flow
- Server computes baselines and experiment proposals weekly.
- Proposed experiments stored as `PROPOSED`.
- User approves in web dashboard to activate.
- Planner reads updated parameters and tags experimental blocks.
- Auditor verifies safe parameter shifts.

## Data Model
Tables:
- `adherence_metrics` (daily per user)
- `outcome_metrics` (daily per user)
- `baseline_metrics` (rolling 7/14/30)
- `experiments`

Experiment fields:
- experiment_id, user_id, domain
- hypothesis
- parameter_modified
- control_window_days
- experiment_window_days
- evaluation_metric
- confidence_threshold
- status (PROPOSED/ACTIVE/ABORTED/COMPLETED)
- started_at, ended_at
- results_summary

## Safety Rules
- Only 1 active experiment per domain.
- No overlapping experiments on same metric.
- Abort on adverse signal spike.
- Max 10% parameter shift per cycle.

## UI Requirements
- Experiment panel: active list, hypothesis, graphs, confidence.
- Proposed experiments review + approve/reject.
- Abort experiment button.
- Experiment badge on affected blocks.

## API Endpoints
- `GET /v1/experiments`
- `POST /v1/experiments/create`
- `POST /v1/experiments/abort`

## Testing Strategy
- Baseline calculation unit tests.
- Experiment proposal rules tests.
- Safety cap enforcement tests.
- Planner integration tests for parameter usage.
