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
      // soft fail
      console.warn(`ID ${key}:${value} must be a string or a number`);
      return { objectId: undefined, objectClass: schema?.objectClass };
    }
    return { objectId: value, objectClass: schema?.objectClass };
  }
  return { objectId: undefined, objectClass: schema?.objectClass };
};
