# Macbook Web Dashboard — AI Lab Console Design

Date: 2026-02-22
PRD: PRD-05
Version: 1.0

## Overview
This design defines a high-density, futuristic AI Lab command console for Macbook. It provides control and inspection of planning, integrity, risk visualization, and debugging. The dashboard consumes real APIs and auto-refreshes every 30s.

## Goals
- High-density, low-noise command interface.
- Real API integration with `x-user-id` header.
- Plan mode switching (A/B/C) and regeneration controls.
- Risk, audit, and sync visibility at a glance.
- Smooth performance and subtle motion.

## Non-Goals
- 3D holographic systems or WebGL terrain.
- Real-time streaming signals.
- Banking visualizations.

## Architecture & Data Flow
- Next.js page in `apps/web`.
- APIs:
  - `GET /v1/plans/:date`
  - `POST /v1/audit/:plan_id/run`
  - `POST /v1/calendar/:plan_id/sync`
- Requests include `x-user-id` header.
- Auto-refresh every 30s (stale-while-revalidate pattern).
- Plan mode toggle triggers mode switch + refetch.

## Layout & Visual System
- 12-column grid: Left 20%, Center 55%, Right 25%.
- Background: `#0A0D12` with subtle animated neural mesh.
- Semantic accents: green (stable), cyan (cognitive), lime (physical), amber (warning), crimson (critical), violet (recovery).
- Motion rules: slow ring rotation, subtle pulse, regeneration ripple.

## Core Components
- **TimelineEnergyStream**: gradient river of the day; distortion on skips; ripple on regeneration.
- **PlanModeToggle**: A/B/C switch with animated transition.
- **BlockCard**: plan blocks with inline rationale.
- **SystemStabilityRing**: rotating ring segmented by risk dimensions.
- **RiskRadarChart**: radar for burnout/injury/deadline/realism risk.
- **GoalPressureOverview**: stacked bars + deadline pressure indicator.
- **AuditReportViewer**: warnings/errors with severity.
- **CalendarSyncStatus**: status badge + last sync time.
- **AI Run Metadata Inspector**: prompt version, model id, hashes.

## Behaviors
- Regenerate plan button triggers ripple and refresh.
- Inline warnings per block.
- Auto-refresh keeps state current.
- Sync and audit actions display progress and last success.

## Performance
- SVG-based charts for lightweight rendering.
- CSS transforms for animation.
- Background mesh in pseudo-element to avoid layout impact.

## Testing Strategy
- Snapshot tests for layout.
- Basic API integration test with mocked responses.
- Visual regression (manual) for motion and density.
