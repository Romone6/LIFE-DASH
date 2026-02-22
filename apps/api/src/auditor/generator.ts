import { OpenRouterClient } from "@lifeos/ai-gateway";
import { env } from "../config";
import { validateAuditJson } from "./validator";
import { sha256 } from "../utils/hash";

const auditorPromptVersion = "auditor-v1";

export type AuditResult = {
  report: any | null;
  aiRun: {
    model_id: string;
    prompt_version: string;
    input_hash: string;
    output_hash: string;
    status: "success" | "invalid";
  };
};

const buildPrompt = (plan: unknown) => {
  return `You are the Adversarial Planning Auditor. Analyze the provided Plan JSON and return a structured audit report JSON only.\n\nRules:\n- Detect unrealistic workload stacking.\n- Detect sleep erosion risk.\n- Detect energy distribution imbalances.\n- Evaluate goal allocation fairness.\n- Return JSON that matches the audit schema.\n- Do not add commentary outside JSON.\n\nPlan:\n${JSON.stringify(plan, null, 2)}`;
};

export async function runAudit(plan: unknown): Promise<AuditResult> {
  const client = new OpenRouterClient({ apiKey: env.OPENROUTER_API_KEY });
  const prompt = buildPrompt(plan);
  const inputHash = sha256(prompt);

  let lastContent = "";
  let lastModel = env.OPENROUTER_MODEL;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await client.chat({
      model: env.OPENROUTER_MODEL,
      messages: [
        { role: "system", content: "Return JSON only." },
        { role: "user", content: prompt },
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

    let parsed: any = null;
    try {
      parsed = JSON.parse(lastContent);
    } catch {
      parsed = null;
    }

    if (!parsed) continue;

    const validation = validateAuditJson(parsed);
    if (!validation.valid) continue;

    return {
      report: parsed,
      aiRun: {
        model_id: lastModel,
        prompt_version: auditorPromptVersion,
        input_hash: inputHash,
        output_hash: outputHash,
        status: "success"
      }
    };
  }

  return {
    report: null,
    aiRun: {
      model_id: lastModel,
      prompt_version: auditorPromptVersion,
      input_hash: inputHash,
      output_hash: sha256(lastContent),
      status: "invalid"
    }
  };
}
