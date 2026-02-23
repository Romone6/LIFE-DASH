import { OpenRouterClient } from "@lifeos/ai-gateway";
import { env } from "../config.js";
import { validatePlanJson } from "./validator.js";
import { checkPlanIntegrity } from "./integrity.js";
import { checkPlanModes, commitmentsImmutable } from "./rules.js";
import { sha256 } from "../utils/hash.js";

const promptVersion = "planner-v1";

export type PlannerInput = {
  user_id: string;
  date_local: string;
  timezone: string;
  profile: unknown;
  goals: unknown[];
  commitments: unknown[];
  governor_state?: unknown;
};

export type GeneratedPlans = {
  plans: unknown[];
  aiRun: {
    model_id: string;
    prompt_version: string;
    input_hash: string;
    output_hash: string;
    status: "success" | "invalid";
  };
};

const buildPrompt = (input: PlannerInput) => {
  return `You are the LifeOS planner. Produce Plan A/B/C JSON only.\n\nRequirements:\n- Output JSON with key "plans" as an array of exactly 3 plan objects.\n- Each plan must satisfy the Plan schema.\n- Modes must be A, B, C and include all required fields.\n- No overlapping blocks.\n- Commitments immutable.\n- Sleep window preserved.\n- Default 10-minute buffers between blocks.\n- Include rationale_per_block and integrity_report_stub.\n\nInput:\n${JSON.stringify(input, null, 2)}`;
};

export async function generatePlans(input: PlannerInput): Promise<GeneratedPlans> {
  const client = new OpenRouterClient({ apiKey: env.OPENROUTER_API_KEY });
  const basePrompt = buildPrompt(input);
  const inputHash = sha256(basePrompt);

  let lastContent = "";
  let lastModel = env.OPENROUTER_MODEL;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await client.chat({
      model: env.OPENROUTER_MODEL,
      messages: [
        { role: "system", content: "Return JSON only." },
        { role: "user", content: basePrompt },
        attempt > 0
          ? {
              role: "user",
              content: `Repair attempt ${attempt}. Previous output failed validation. Provide corrected JSON only.\n\nPrevious output:\n${lastContent}`
            }
          : null
      ].filter(Boolean) as Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }>,
      response_format: { type: "json_object" },
      temperature: 0.2
    });

    lastModel = response.model;
    lastContent = response.choices[0]?.message?.content ?? "";
    const outputHash = sha256(lastContent);

    let parsed: { plans?: unknown[] } | null = null;
    try {
      parsed = JSON.parse(lastContent);
    } catch {
      parsed = null;
    }

    if (!parsed?.plans || !Array.isArray(parsed.plans)) {
      continue;
    }

    const modeViolations = checkPlanModes(parsed.plans as any[]);
    if (modeViolations.length > 0) {
      continue;
    }

    const validPlans: unknown[] = [];
    for (const plan of parsed.plans) {
      const validation = validatePlanJson(plan);
      if (!validation.valid) continue;

      const commitmentViolations = commitmentsImmutable(
        plan as any,
        input.commitments as any[]
      );
      if (commitmentViolations.length > 0) continue;

      const integrity = checkPlanIntegrity(plan as any);
      if (!integrity.ok) continue;

      validPlans.push(plan);
    }

    if (validPlans.length === 3) {
      const findByMode = (mode: string) =>
        (validPlans as any[]).find((plan) => plan.mode === mode);
      const planA = findByMode("A");
      const planC = findByMode("C");
      const minutes = (plan: any) =>
        (plan.blocks ?? []).reduce((sum: number, block: any) => {
          const start = new Date(block.start_at).getTime();
          const end = new Date(block.end_at).getTime();
          return sum + Math.max(0, (end - start) / 60000);
        }, 0);

      if (planA && planC) {
        const ratio = minutes(planC) / Math.max(1, minutes(planA));
        if (ratio > 0.6) {
          continue;
        }
      }

      return {
        plans: validPlans,
        aiRun: {
          model_id: lastModel,
          prompt_version: promptVersion,
          input_hash: inputHash,
          output_hash: outputHash,
          status: "success"
        }
      };
    }
  }

  return {
    plans: [],
    aiRun: {
      model_id: lastModel,
      prompt_version: promptVersion,
      input_hash: inputHash,
      output_hash: sha256(lastContent),
      status: "invalid"
    }
  };
}
