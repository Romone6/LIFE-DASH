import { formatISO, setHours, setMinutes, parseISO } from "date-fns";

export function generateStabilityPlan(input: {
  user_id: string;
  date_local: string;
  timezone: string;
  profile: any;
  commitments: any[];
}) {
  const baseDate = parseISO(`${input.date_local}T00:00:00Z`);
  const makeTime = (hour: number, minute: number) => {
    const date = setMinutes(setHours(baseDate, hour), minute);
    return formatISO(date);
  };

  const blocks = [
    {
      block_id: `stability-${input.date_local}-1`,
      title: "Active Recovery",
      type: "recovery",
      start_at: makeTime(9, 0),
      end_at: makeTime(10, 0),
      intensity: "low",
      confidence_level: "LOW",
      experimental_flag: false
    },
    {
      block_id: `stability-${input.date_local}-2`,
      title: "Light Movement",
      type: "recovery",
      start_at: makeTime(12, 0),
      end_at: makeTime(12, 30),
      intensity: "low",
      confidence_level: "LOW",
      experimental_flag: false
    },
    {
      block_id: `stability-${input.date_local}-3`,
      title: "Reflection",
      type: "recovery",
      start_at: makeTime(18, 0),
      end_at: makeTime(18, 30),
      intensity: "low",
      confidence_level: "LOW",
      experimental_flag: false
    }
  ];

  return {
    plan_id: `${input.user_id}-${input.date_local}-stability-A`,
    user_id: input.user_id,
    date_local: input.date_local,
    timezone: input.timezone,
    schema_version: "1.0",
    mode: "A",
    profile_snapshot: input.profile,
    commitments: input.commitments,
    blocks,
    contingencies: [],
    rationale_per_block: {},
    integrity_report_stub: {}
  };
}
