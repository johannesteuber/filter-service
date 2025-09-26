import { findMatchingSchema } from "./filter";
import { Json, JSONObject, ObjectIdentifier, ApiSchema, ObjectIdentifierAndAttributes } from "./types";

export const analyzeApiResult = (obj: Json, objectIdentifiers: ObjectIdentifierAndAttributes[] = [], schema?: ApiSchema | ApiSchema[]): ObjectIdentifierAndAttributes[] => {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      analyzeApiResult(obj[i], objectIdentifiers, Array.isArray(schema) ? findMatchingSchema(obj[i], schema) : schema);
    }
  } else if (typeof obj === "object" && obj !== null) {
    if (Array.isArray(schema)) throw new Error("Multiple schemas only allowed for arrays");
    if (schema?.type !== "object") throw new Error("Invalid schema");
    const identifier = findIdentifierOfObject(obj, schema)
    if (identifier) objectIdentifiers.push({...identifier, attributes: Object.keys(obj)}) //TODO: check for duplicates

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "object" || Array.isArray(value)) {
        const propertySchema = schema.properties?.[key]
        if (propertySchema && (propertySchema.type === "array" && !Array.isArray(value))) throw new Error("Invalid array schema for object");
        if (propertySchema && (propertySchema.type === "object" && typeof value !== "object")) throw new Error("Invalid object schema for array");

        analyzeApiResult(value, objectIdentifiers, propertySchema?.type === "array" ? propertySchema.items : propertySchema);
      }
    }
  }
  return objectIdentifiers;
};

export const findIdentifierOfObject = (object: JSONObject, schema?: ApiSchema): ObjectIdentifier | undefined => {
  let idKey = "id";
  if (schema && schema && schema.type !== "object") {
    throw new Error("Invalid schema");
  }
  if (schema) {
    idKey = schema.uniqueIdentifier ?? "id";
    if (!idKey) {
      return { type: "class", class: schema.objectClass };
    }
  }

  for (const [key, value] of Object.entries(object)) {
    if (key !== idKey) continue;
    if (typeof value !== "string") {
      throw new Error("id must be a string")
    }
    return { type: "id", key, id: value, ...schema && { class: schema?.objectClass } };
  }
}