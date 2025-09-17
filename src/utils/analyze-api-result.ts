import { findMatchingSchema } from "./filter";
import { Json, JSONObject, Schema } from "./types";

export const analyzeApiResult = (obj: Json, objectIds: string[] = [], schema?: Schema) => {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      analyzeApiResult(obj[i], objectIds, Array.isArray(schema) ? findMatchingSchema(obj[i], schema) : schema);
    }
  } else if (typeof obj === "object" && obj !== null) {
    if (Array.isArray(schema)) throw new Error("Invalid schema");
    const { id } = findIdOfObject(obj, schema) ?? {}
    if (id) objectIds.push(id);

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "object" || Array.isArray(value)) {
        if (schema && (schema.type !== "array" && schema.type !== "object")) throw new Error("Invalid schema");
        analyzeApiResult(value, objectIds, schema?.type === "array" ? schema.items : schema?.properties?.[key]);
      }
    }
  }
  return objectIds;
};

export const findIdOfObject = (object: JSONObject, schema?: Schema): { key: string; id: string } | undefined => {
  let idKey = "id";
  if (schema && schema.type === "object") {
    idKey = schema.uniqueIdentifier ?? "id";
  }
  for (const [key, value] of Object.entries(object)) {
    if (key !== idKey) continue;
    if (typeof value !== "string") {
      throw new Error("id must be a string")
    }
    return { key, id: value };
  }
}