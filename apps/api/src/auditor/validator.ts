import { createRequire } from "module";
import { auditSchema } from "@lifeos/schemas";

const require = createRequire(import.meta.url);
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validateAudit = ajv.compile(auditSchema);

export function validateAuditJson(data: unknown) {
  const valid = validateAudit(data);
  return {
    valid,
    errors: validateAudit.errors ?? []
  };
}
