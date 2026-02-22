# Strategic Multi-Year Goal Architecture + Long Horizon Modeling Design

Date: 2026-02-22
PRD: PRD-11
Version: 1.0

## Overview
This design introduces a long-horizon modeling layer connecting daily plans to 1–5 year strategic objectives via milestone decomposition, trajectory projection, and stability-aware pacing.

## Goals
- Multi-year goals with hierarchical mapping to daily blocks.
- Auto-generated milestones with manual edits allowed.
- Trajectory projection curves with confidence gating.
- Strategic constraints enforced by Governor state.
- Terrain visualization overlay for projections.

## Non-Goals
- Market prediction, financial modeling, life path rewriting.

## Hierarchical Model
Levels:
- Vision (3–5 year)
- Strategic Objective (1 year)
- Quarterly Milestone
- Monthly Target
- Weekly Commitment
- Daily Block

Rules:
- Every daily block must map upward.
- No orphan tasks.
- Max 5 active Vision goals.

## Data Model
Multi-year goal schema:
- goal_id, title, category, time_horizon_years
- success_metric, target_value, current_value
- risk_level, confidence_score

Milestone structure is stored with versioned edits.

## Decomposition Engine
- Break multi-year targets into annual objectives.
- Annual -> quarterly -> monthly -> weekly.
- Capacity constraints:
  - Max 3 active quarterly milestones per category.
  - Governor approval for aggressive timelines.
- Risk-based pacing and recalibration on repeated misses.

## Trajectory Projection
Inputs:
- current_value
- historical_trend
- adherence_rate
- governor_state

Windows:
- 6 months, 1 year, 3 years

Method:
- Trend extrapolation with risk-weighted dampening.
- Confidence gating reduces projection amplitude when unstable.

## Strategic Constraints
- Burnout elevated → reduce pacing.
- Repeated milestone failure → recalibrate timeline.
- Stability high → allow controlled acceleration.

## UI Requirements
Strategic Map View:
- 3D terrain integrates long-horizon peaks.
- Milestone nodes along slope.
- Trajectory arc overlay (v1).

Timeline Panel:
- Vision summary
- Quarterly progress bars
- Risk + confidence badges

## API Endpoints
- `POST /v1/strategic-goals`
- `GET /v1/strategic-goals`
- `POST /v1/milestones/generate`

## Testing Strategy
- Decomposition validation tests.
- Constraint enforcement tests.
- Projection confidence gating tests.
