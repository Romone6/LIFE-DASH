type Commitment = {
  id?: string;
  title?: string;
  start_at: string;
  end_at: string;
  hard_flag?: boolean;
};

type Plan = {
  mode?: string;
  commitments?: Commitment[];
};

export type RuleViolation = {
  code: "MODE" | "COMMITMENT";
  message: string;
};

export function checkPlanModes(plans: Plan[]): RuleViolation[] {
  const modes = plans.map((p) => p.mode).filter(Boolean) as string[];
  const required = ["A", "B", "C"];
  const missing = required.filter((mode) => !modes.includes(mode));

  if (missing.length > 0) {
    return [
      {
        code: "MODE",
        message: `Missing modes: ${missing.join(", ")}`
      }
    ];
  }

  return [];
}

export function commitmentsImmutable(
  plan: Plan,
  inputCommitments: Commitment[]
): RuleViolation[] {
  const planCommitments = plan.commitments ?? [];
  if (planCommitments.length !== inputCommitments.length) {
    return [
      {
        code: "COMMITMENT",
        message: "Commitments count mismatch"
      }
    ];
  }

  const normalize = (c: Commitment) =>
    `${c.id ?? c.title ?? ""}|${c.start_at}|${c.end_at}|${c.hard_flag ?? false}`;

  const inputSet = new Set(inputCommitments.map(normalize));
  for (const commitment of planCommitments) {
    if (!inputSet.has(normalize(commitment))) {
      return [
        {
          code: "COMMITMENT",
          message: "Commitments mutated"
        }
      ];
    }
  }

  return [];
}
