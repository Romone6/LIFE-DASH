type EvidenceCard = {
  id: string;
  population_applicability: string;
  certainty_level: string;
};

type PlanBlock = {
  block_id: string;
  confidence_level?: string;
  evidence_refs?: string[];
  experimental_flag?: boolean;
};

type Plan = {
  blocks: PlanBlock[];
};

export function applyEvidenceGate(plans: Plan[], evidenceCards: EvidenceCard[]) {
  const evidenceById = new Map(evidenceCards.map((e) => [e.id, e]));

  for (const plan of plans) {
    for (const block of plan.blocks) {
      const refs = block.evidence_refs ?? [];
      if (refs.length === 0) {
        block.confidence_level = "LOW";
      }

      const evidence = refs
        .map((id) => evidenceById.get(id))
        .filter(Boolean) as EvidenceCard[];

      if (block.confidence_level === "HIGH" && evidence.length === 0) {
        block.confidence_level = "LOW";
      }

      const populationMismatch = evidence.some(
        (e) => e.population_applicability === "adolescent"
      );
      if (populationMismatch) {
        block.confidence_level = "LOW";
      }

      const veryLow = evidence.some((e) => e.certainty_level === "VERY_LOW");
      if (veryLow) {
        block.confidence_level = "EXPERIMENTAL";
        block.experimental_flag = true;
      }

      if (!block.confidence_level) {
        block.confidence_level = "LOW";
      }
    }
  }

  return plans;
}
