# Digital Twin 3D Reconstruction Pipeline (Hybrid)

Date: 2026-02-23

## Objective
Implement a hybrid reconstruction pipeline: photogrammetry for shape fidelity + parametric body model fitting for a clean, animatable mesh. Provide recovery-status overlay as the default visualization mode.

## Pipeline Overview
1. User uploads photo set (front/side/back + optional 45°).
2. Photos stored in private Supabase Storage.
3. Worker runs photogrammetry (COLMAP/Meshroom) to generate mesh.
4. Fit SMPL-style model to mesh; export coefficients + clean mesh.
5. Produce LOD + Draco-compressed glTF for real-time use.
6. Persist model metadata and activate latest model.

## Storage
Private buckets:
- `twin-photos`
- `twin-models`

## Database Tables
- `twin_photo_sets`: photo set lifecycle
- `twin_photos`: individual photo metadata
- `twin_jobs`: reconstruction job state
- `twin_models`: output artifacts + parametric coefficients

## API Endpoints
- `POST /v1/twin/photo-set` → create set + signed upload URLs
- `POST /v1/twin/photo` → confirm upload metadata
- `POST /v1/twin/reconstruct` → enqueue job
- `GET /v1/twin/status` → job status
- `GET /v1/twin/model` → active model + signed URLs

## Recovery Overlay (Default)
Recovery status is derived from training recency and is applied as a shader overlay:
- Red: just trained
- Orange: low rest
- Yellow: medium rest
- Light green: high rest
- Green: full recovery

## Worker
- Python-based worker with optional CUDA
- Supports dry-run mode for CI (skips photogrammetry)
- Emits artifacts to `twin-models`

## Testing
- API tests for lifecycle endpoints
- Unit tests for angle validation and recovery color mapping
- Worker dry-run test

## Rollout
1. Enable uploads + job queue
2. Enable rendering per-user once model is READY
3. Enable recovery overlay by default
