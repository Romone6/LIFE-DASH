import { describe, expect, test } from "vitest";
import { applyEvidenceGate } from "../src/planner/evidenceGate";

describe("applyEvidenceGate", () => {
  test("downgrades high confidence without evidence", () => {
    const plans = [
      {
        blocks: [
          { block_id: "b1", confidence_level: "HIGH", evidence_refs: [] }
        ]
      }
    ];

    const result = applyEvidenceGate(plans as any, []);
    expect(result[0].blocks[0].confidence_level).toBe("LOW");
  });

  test("marks experimental for very low certainty", () => {
    const plans = [
      {
        blocks: [
          { block_id: "b1", confidence_level: "HIGH", evidence_refs: ["e1"] }
        ]
      }
    ];
    const evidence = [
      { id: "e1", population_applicability: "adult", certainty_level: "VERY_LOW" }
    ];

    const result = applyEvidenceGate(plans as any, evidence as any);
    expect(result[0].blocks[0].confidence_level).toBe("EXPERIMENTAL");
    expect(result[0].blocks[0].experimental_flag).toBe(true);
  });
});
