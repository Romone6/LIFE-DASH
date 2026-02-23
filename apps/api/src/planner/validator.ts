import { createRequire } from "module";
import { planSchema } from "@lifeos/schemas";

const require = createRequire(import.meta.url);
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validatePlan = ajv.compile(planSchema);

export function validatePlanJson(data: unknown) {
  const valid = validatePlan(data);
  return {
    valid,
    errors: validatePlan.errors ?? []
  };
}
