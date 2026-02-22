# Evidence Engine v1 — Cite-Gated Recommendation Layer Design

Date: 2026-02-22
PRD: PRD-06
Version: 1.0

## Overview
This design introduces an Evidence Card system that attaches graded, structured justification to planning decisions. The planner cannot make high-confidence recommendations without linking to evidence records. Enforcement is deterministic and audited.

## Goals
- EvidenceCards stored per user.
- Cite-gated planner rules enforced deterministically.
- Evidence references attached to plan blocks.
- Confidence grading visible in UI.
- Auditor verifies evidence linkage.

## Non-Goals
- Automated literature ingestion or PubMed scraping.
- Systematic review automation.

## Architecture & Flow
1. EvidenceCards stored independently in DB (per user).
2. Planner prompt includes EvidenceCard IDs + minimal metadata.
3. Planner must attach evidence_ids to HIGH confidence blocks.
4. Deterministic evidence gate validates and downgrades invalid claims.
5. Auditor verifies evidence linkage and downgrades improper labeling.

## Data Model Changes
New table: `evidence_cards`
- id uuid pk
- user_id uuid
- title text
- domain text
- claim text
- population_applicability text
- study_type text
- effect_direction text
- certainty_level text
- risk_notes text
- source_citation text
- date_added timestamptz
- last_reviewed timestamptz

Plan block extension:
- confidence_level (HIGH, MODERATE, LOW, EXPERIMENTAL)
- evidence_refs (array of evidence_ids)
- experimental_flag (boolean)

## Deterministic Enforcement Rules
- If block marked HIGH → must include at least one evidence_id.
- If no evidence attached → downgrade to LOW.
- If population mismatch → downgrade certainty.
- If certainty VERY_LOW → set experimental_flag and confidence EXPERIMENTAL.

## API Endpoints
- `POST /v1/evidence/create` (admin-only)
- `GET /v1/evidence` (list per user)

## UI Requirements
- Confidence badge on each block.
- Evidence icon when evidence_refs present.
- Evidence Panel showing claim, study type, certainty, population match, citation.
- Debug view listing evidence used and downgrades.

## Testing Strategy
- Unit tests for evidence gate downgrades.
- Schema validation tests for evidence_refs and confidence_level.
- Auditor tests for improper labeling detection.

## Open Questions
- Should population mismatch downgrade to MODERATE or LOW by default?
- Should evidence cards support multiple citations per claim?
