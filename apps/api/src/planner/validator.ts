import Ajv from "ajv";
import addFormats from "ajv-formats";
import { planSchema } from "@lifeos/schemas";

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
