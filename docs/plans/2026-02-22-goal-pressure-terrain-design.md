# Goal Pressure Field + Topographic Terrain Engine Design

Date: 2026-02-22
PRD: PRD-08
Version: 1.0

## Overview
This design adds a 3D terrain system to visualize goal urgency, deadline pressure, systemic load, and alignment stability as a living topographic mesh within the AI Lab dashboard.

## Goals
- Integrated 3D terrain module in dashboard.
- Server-side terrain computation (`/v1/terrain/state`).
- Deadline pulse and alignment color gradient.
- Projection mode with confidence gating.
- Android 2D contour fallback.

## Non-Goals
- Real-time physics, VR, or geological realism.

## Architecture & Data Flow
- Server computes terrain parameters from goals + audit risk + adherence trends.
- Client renders Three.js grid mesh from terrain state.
- Recompute on plan regeneration or daily review.
- Android uses contour map from same state.

## Terrain Model
- Base plane: grid mesh, max 5000 vertices.
- Peak height formula:
  `peak_height = (priority_weight * 100) * inverse_days_to_deadline * risk_modifier`
- `risk_modifier` derived from audit deadline risk score.
- Peak decay: progress flattens peaks proportionally.

## Color Mapping
- Green: aligned + low risk.
- Amber: rising pressure.
- Crimson: unstable or overdue.

## Visual Behaviors
- Deadline pulse: subtle radial pulse, frequency increases as deadline nears.
- Alignment gradient: electric green glow when stable, amber flicker when unstable.
- Overload distortion: ripple if burnout_risk exceeds threshold.

## Projection Mode
- 30d/90d morph based on adherence trend.
- Confidence gate reduces morph amplitude when low.

## UI Requirements
Desktop:
- Full-screen toggle
- Mouse rotate + zoom
- Goal label on hover
- Legend panel

Android:
- 2D contour map
- Scrollable goal pressure list

## Performance Constraints
- FPS target 60.
- LOD for weak GPUs.
- Fallback to static mesh if performance drops.

## Testing Strategy
- Render smoke test with sample terrain state.
- Performance check at max vertex budget.
- Projection mode morph validation.
