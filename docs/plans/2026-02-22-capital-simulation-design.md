# Capital Allocation Simulation Engine + Future Banking Connector Pathway Design

Date: 2026-02-22
PRD: PRD-12
Version: 1.0

## Overview
This design introduces a manual-input capital simulation engine that models income distribution, savings buckets, runway projections, and goal funding timelines. No live banking integration in v1, but a connector interface stub is defined.

## Goals
- Manual monthly income/expense inputs (single currency).
- Capital buckets with priority weights.
- Runway calculator with volatility adjustment.
- Goal funding timeline projections with confidence.
- Capital risk scoring feeding Stability Governor.

## Non-Goals
- Direct bank API integration or fund movement.

## Architecture & Flow
- Server-side simulation engine.
- Manual input via dashboard UI.
- Connector stub defined but unused.
- Simulation results power dashboard visualizations.

## Data Model
Tables:
- `capital_income_sources` (user_id, title, amount_monthly, stability_score, volatility_flag)
- `capital_expenses` (user_id, category, amount_monthly, fixed_flag)
- `capital_buckets` (user_id, name, target_amount, current_amount, priority_weight)

## Allocation Logic
- `net_surplus = total_income - total_expenses`
- Distribute surplus by priority_weight.
- Emergency bucket filled first if below threshold.
- No negative allocation.
- Max 50% of surplus to speculative bucket.

## Runway Engine
- `months_of_runway = total_savings / monthly_expenses`
- Adjust downward if income volatility high.

## Goal Funding Projection
- Based on allocation rate, required capital, and governor state.
- Confidence score shown; dampen aggressive assumptions under risk.

## Capital Risk Scoring
Dimensions:
- liquidity_risk
- income_volatility_risk
- overcommitment_risk

Feeds Stability Governor.

## Connector Architecture Stub
Interface: `BankConnector`
Capabilities:
- read_transactions
- read_balances
- write_transfers (future)

## UI Requirements
- Bucket progress rings
- Runway meter
- Income vs expense graph
- Goal funding timeline
- Simulation controls: allocation %, aggressive mode, volatility slider
- Risk badges: liquidity + volatility

## API Endpoints
- `POST /v1/capital/income`
- `POST /v1/capital/expense`
- `GET /v1/capital/simulation`

## Testing Strategy
- Surplus and allocation tests.
- Constraint enforcement tests.
- Runway adjustment tests.
- Risk scoring tests.
