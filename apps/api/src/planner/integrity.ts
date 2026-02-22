import { differenceInMinutes, isBefore, addHours } from "date-fns";

type PlanBlock = {
  block_id: string;
  title: string;
  type: string;
  start_at: string;
  end_at: string;
  intensity?: string;
};

type Commitment = {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  hard_flag: boolean;
};

type Plan = {
  profile_snapshot: {
    sleep_window: {
      start: string;
      end: string;
      hard_flag: boolean;
    };
  };
  commitments: Commitment[];
  blocks: PlanBlock[];
};

export type IntegrityViolation = {
  code:
    | "OVERLAP"
    | "BUFFER"
    | "SLEEP_WINDOW"
    | "COMMITMENT"
    | "MAX_HOURS"
    | "CONSEC_HIGH"
    | "LATE_TRAIN"
    | "DEEP_WORK_MIN";
  message: string;
  block_ids?: string[];
};

export type IntegrityReport = {
  ok: boolean;
  violations: IntegrityViolation[];
};

const parse = (iso: string) => new Date(iso);

const overlaps = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) => {
  return aStart < bEnd && bStart < aEnd;
};

const durationMinutes = (start: string, end: string) => {
  return differenceInMinutes(parse(end), parse(start));
};

const isHighEffort = (block: PlanBlock) => {
  if (block.intensity === "high") return true;
  return block.type === "deep_work" || block.type === "training";
};

export function checkPlanIntegrity(plan: Plan): IntegrityReport {
  const violations: IntegrityViolation[] = [];

  const blocks = [...plan.blocks].sort(
    (a, b) => parse(a.start_at).getTime() - parse(b.start_at).getTime()
  );

  for (let i = 0; i < blocks.length - 1; i += 1) {
    const current = blocks[i];
    const next = blocks[i + 1];
    const currentEnd = parse(current.end_at);
    const nextStart = parse(next.start_at);

    if (currentEnd > nextStart) {
      violations.push({
        code: "OVERLAP",
        message: "Blocks overlap",
        block_ids: [current.block_id, next.block_id]
      });
    }

    const bufferMinutes = differenceInMinutes(nextStart, currentEnd);
    if (bufferMinutes < 10) {
      violations.push({
        code: "BUFFER",
        message: "Blocks must have 10-minute buffers",
        block_ids: [current.block_id, next.block_id]
      });
    }
  }

  const sleepStart = parse(plan.profile_snapshot.sleep_window.start);
  const sleepEnd = parse(plan.profile_snapshot.sleep_window.end);
  for (const block of blocks) {
    const blockStart = parse(block.start_at);
    const blockEnd = parse(block.end_at);
    if (overlaps(blockStart, blockEnd, sleepStart, sleepEnd)) {
      violations.push({
        code: "SLEEP_WINDOW",
        message: "Block overlaps sleep window",
        block_ids: [block.block_id]
      });
    }
  }

  for (const block of blocks) {
    for (const commitment of plan.commitments) {
      if (!commitment.hard_flag) continue;
      const cStart = parse(commitment.start_at);
      const cEnd = parse(commitment.end_at);
      const bStart = parse(block.start_at);
      const bEnd = parse(block.end_at);
      if (overlaps(bStart, bEnd, cStart, cEnd)) {
        violations.push({
          code: "COMMITMENT",
          message: "Block overlaps commitment",
          block_ids: [block.block_id, commitment.id]
        });
      }
    }
  }

  const totalMinutes = blocks.reduce(
    (sum, block) => sum + durationMinutes(block.start_at, block.end_at),
    0
  );
  const commitmentMinutes = plan.commitments.reduce(
    (sum, c) => sum + durationMinutes(c.start_at, c.end_at),
    0
  );

  if (totalMinutes + commitmentMinutes > 16 * 60) {
    violations.push({
      code: "MAX_HOURS",
      message: "Scheduled time exceeds 16 waking hours"
    });
  }

  let consecutiveHigh = 0;
  for (const block of blocks) {
    if (isHighEffort(block)) {
      consecutiveHigh += 1;
    } else {
      consecutiveHigh = 0;
    }

    if (consecutiveHigh > 3) {
      violations.push({
        code: "CONSEC_HIGH",
        message: "More than 3 high-effort blocks consecutively",
        block_ids: [block.block_id]
      });
      break;
    }
  }

  const sleepWindowStart = parse(plan.profile_snapshot.sleep_window.start);
  const noTrainingAfter = addHours(sleepWindowStart, -3);
  for (const block of blocks) {
    if (block.type !== "training") continue;
    if (block.intensity !== "high") continue;
    const blockEnd = parse(block.end_at);
    if (!isBefore(blockEnd, noTrainingAfter)) {
      violations.push({
        code: "LATE_TRAIN",
        message: "High intensity training within 3h of sleep",
        block_ids: [block.block_id]
      });
    }
  }

  for (const block of blocks) {
    if (block.type !== "deep_work") continue;
    const minutes = durationMinutes(block.start_at, block.end_at);
    if (minutes < 30) {
      violations.push({
        code: "DEEP_WORK_MIN",
        message: "Deep work block must be at least 30 minutes",
        block_ids: [block.block_id]
      });
    }
  }

  return { ok: violations.length === 0, violations };
}
