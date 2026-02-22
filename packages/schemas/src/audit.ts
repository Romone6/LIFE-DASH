export const auditSchemaVersion = "1.0";

export const auditSchema = {
  $id: "lifeos.audit",
  type: "object",
  additionalProperties: false,
  required: [
    "audit_id",
    "plan_id",
    "status",
    "severity",
    "errors",
    "warnings",
    "risk_register",
    "suggested_fixes",
    "auditor_model_info"
  ],
  properties: {
    audit_id: { type: "string" },
    plan_id: { type: "string" },
    status: { enum: ["PASS", "PASS_WITH_WARNINGS", "FAIL"] },
    severity: { enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
    errors: { type: "array", items: { type: "string" } },
    warnings: { type: "array", items: { type: "string" } },
    risk_register: {
      type: "object",
      additionalProperties: false,
      required: [
        "burnout_risk",
        "injury_risk",
        "deadline_risk",
        "schedule_realism_risk"
      ],
      properties: {
        burnout_risk: { type: "number" },
        injury_risk: { type: "number" },
        deadline_risk: { type: "number" },
        schedule_realism_risk: { type: "number" }
      }
    },
    suggested_fixes: { type: "array", items: { type: "string" } },
    auditor_model_info: {
      type: "object",
      additionalProperties: true
    }
  }
} as const;
