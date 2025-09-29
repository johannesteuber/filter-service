import { ApiSchema, JSONObject, AccessTarget } from "../types/types";

export const resolveAccessTarget = (object: JSONObject, schema?: ApiSchema): AccessTarget => {
  let idKey = "id";
  if (schema && schema && schema.type !== "object") {
    throw new Error("Invalid schema");
  }
  if (schema && schema.uniqueIdentifier) {
    idKey = schema.uniqueIdentifier;
  }

  for (const [key, value] of Object.entries(object)) {
    if (key !== idKey) continue;
    if (typeof value !== "string" && typeof value !== "number") {
      console.warn(`ID ${key}:${value} must be a string or a number`);
      return { id: undefined, class: schema?.objectClass };
    }
    return { id: value, class: schema?.objectClass };
  }
  return { id: undefined, class: undefined };
};
