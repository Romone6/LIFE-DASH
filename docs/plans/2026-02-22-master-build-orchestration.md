# Master Build Orchestration Document

Project: LifeOS
Version: 1.0
Execution Mode: Sequential Phase-Gated Build

## Objective
Orchestrate end-to-end build of LifeOS across backend, web dashboard, Android client, visualization layers, and simulation engines with controlled dependencies and validation gates.

## Global Constraints
- Single source of truth: backend database
- No feature skipping
- Phase gate required
- Rollback enabled
- Performance budget enforced

## Infrastructure Bootstrap
Repository structure:
- Monorepo with pnpm
- Apps: `apps/web`, `apps/android`, `apps/api`
- Packages: `packages/types`, `packages/ui`, `packages/ai-gateway`, `packages/schemas`

Core stack:
- Backend: Node + Fastify + TypeScript
- Database: Supabase Postgres
- Auth: Supabase Auth
- Web: Next.js
- Android: Kotlin + Jetpack Compose
- AI gateway: OpenRouter (server-only)
- Visualization: Three.js (desktop only)

Environment files:
- `.env.local`
- `.env.production`

## Phase Sequence (Phase-Gated)
P0: Infrastructure Foundation
- Builds: Repo scaffold, Supabase setup, Auth wiring, OpenRouter gateway, Shared schema definitions
- Gate: Auth + API operational

P1: Core Planning Engine
- Builds: PRD-01
- Gate: Valid Plan A/B/C generation

P2: Integrity + Auditor Layer
- Builds: PRD-02
- Gate: Plan cannot activate without audit PASS

P3: Android Health Ingestion
- Builds: PRD-03
- Gate: SignalSnapshot visible in DB

P4: Calendar Execution Layer
- Builds: PRD-04
- Gate: Plan mirrors correctly to Google Calendar

P5: Web Dashboard Core
- Builds: PRD-05
- Gate: Dashboard displays active plan + audit

P6: Evidence Engine
- Builds: PRD-06
- Gate: High-confidence blocks require evidence

P7: Holographic Twin
- Builds: PRD-07
- Gate: Desktop twin renders + stable performance

P8: Goal Terrain Engine
- Builds: PRD-08
- Gate: Terrain reflects goal pressure correctly

P9: Adaptive Learning Engine
- Builds: PRD-09
- Gate: Experiments can run + update parameters

P10: System Stability Governor
- Builds: PRD-10
- Gate: Governor overrides aggressive plan safely

P11: Long-Horizon Modeling
- Builds: PRD-11
- Gate: Daily blocks map to multi-year structure

P12: Capital Simulation Engine
- Builds: PRD-12
- Gate: Capital dashboard simulation operational

## Versioning Strategy
- Schema versioning required
- Prompt versioning required
- Model ID tracking required
- Migration files required

## Performance Budgets
Web dashboard:
- Initial load < 2.5s
- Terrain FPS >= 50
- Twin FPS >= 50

Android:
- Cold start < 2s
- Memory limit < 200MB

## Quality Gates
- No overlapping schedule blocks
- No fabricated evidence citations
- Governor always respected
- No infinite regeneration loops
- Calendar sync idempotent
- Android never crashes on missing signals

## Rollback Strategy
- Feature branches per phase
- Migration rollback required for DB changes
- AI prompt version revert supported
- Phase isolation enforced (no cross-phase coupling before gate pass)

## CI/CD Pipeline
Required checks:
- TypeScript compile
- Schema validation tests
- Planner JSON validation test
- Audit failure simulation test

Deployment strategy:
- Staging first
- Manual approval for production

## Agent Execution Protocol
Rules:
- Do not start next phase until gate passed
- Log completion summary after each phase
- Generate migration files explicitly
- Never expose OpenRouter key client-side
- Respect performance budgets

Per-phase output required:
- Files created
- Migrations created
- Endpoints added
- Tests added
- Performance metrics

## Final System Validation
End-to-end test:
1. Create strategic goal
2. Generate Plan A
3. Audit pass
4. Calendar sync
5. Complete block on Android
6. SignalSnapshot ingestion
7. Governor evaluation
8. Experiment suggestion
9. Projection update

Must pass before release: true
