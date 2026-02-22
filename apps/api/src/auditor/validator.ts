import Ajv from "ajv";
import addFormats from "ajv-formats";
import { auditSchema } from "@lifeos/schemas";

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
