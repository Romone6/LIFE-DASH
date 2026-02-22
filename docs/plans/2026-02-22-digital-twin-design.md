# Holographic Digital Twin — Performance Visualization System Design

Date: 2026-02-22
PRD: PRD-07
Version: 1.0

## Overview
This design adds a symbolic, data-driven holographic digital twin to the AI Lab dashboard. It visualizes physiological, cognitive, and execution state. It is not medical modeling and avoids photorealism.

## Goals
- Desktop WebGL twin with state-driven overlays.
- Two custom low-poly silhouettes (feminine/masculine).
- User preference stored server-side.
- Projection modes (current, 30d, 90d) with confidence gating.
- Android 2D fallback.

## Non-Goals
- Medical or anatomical modeling.
- Photorealistic rendering or AI face generation.

## Architecture & Asset Pipeline
- Model two custom low-poly silhouettes using external tools (Blender).
- Export GLB assets and store in `apps/web/public/assets/twin/`.
- Select silhouette based on persisted user preference.
- Photo uploads stored in private Supabase bucket for reference only.

## Data Model & API
Twin state schema:
- twin_id, user_id
- base_weight, bodyfat_estimate
- performance_metrics
- signal_state: recovery_score, cognitive_load_score, physical_strain_score, adherence_score
- projection_state: projected_weight_30d, projected_weight_90d, confidence_level
- visual_parameters

Profile updates:
- `twin_silhouette_pref` (feminine/masculine)

API:
- `POST /v1/twin/update`
- `GET /v1/twin`

## Visualization Logic
- Low-poly neutral silhouettes.
- Recovery aura (violet gradient) proportional to recovery_score.
- Cognitive overlay (cyan neural glow).
- Physical overlay (lime shading shift).
- Adherence overlay (electric green pulse rhythm).

## Projection Mode
- Toggle between current, 30d, 90d.
- Smooth morph animation between states.
- Cap projection shifts if confidence low.

## UI Requirements
Desktop:
- Full holographic twin panel
- Mouse drag rotation
- Projection toggle
- Signal overlay legend

Android:
- Static vector silhouette (selected preference)
- State summary ring
- Projection values text-only

## Performance Constraints
- Max 60fps; disable mesh animation if GPU slow.
- No full 3D on Android v1.

## Testing Strategy
- Render smoke test with both GLB assets.
- Performance check with slow GPU emulation.
- UI validation for preference switching.

## Open Questions
- Should silhouettes support additional body types in v1.1?
- Do we allow user-uploaded silhouettes in the future?
