import { ApiSchema, JSONObject, AccessTarget } from "../types/types";

export const resolveAccessTarget = (object: JSONObject, schema?: ApiSchema): AccessTarget => {
  let idKey = "id";
  if (schema && schema && schema.type !== "object") {
    throw new Error("Invalid schema");
  }
  if (schema) {
    idKey = schema.uniqueIdentifier ?? "id";
    if (!idKey) {
      return { id: undefined, class: schema.objectClass };
    }
  }

  for (const [key, value] of Object.entries(object)) {
    if (key !== idKey) continue;
    if (typeof value !== "string") {
      throw new Error(`id ${key}:${value} must be a string, ${JSON.stringify(object)}`)
    }
    return { id: value, class: schema?.objectClass };
  }
  return { id: undefined, class: undefined };
}