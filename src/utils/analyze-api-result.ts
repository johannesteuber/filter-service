import { Json, JSONObject, Schema } from "./types";

export const analyzeApiResult = (apiResult: Json, objectIds: string[] = [], schema?: Schema) => {
  if (Array.isArray(apiResult)) {
    for (let i = 0; i < apiResult.length; i++) {
      analyzeApiResult(apiResult[i], objectIds, schema);
    }
  } else if (typeof apiResult === "object" && apiResult !== null) {
    const { id } = findIdOfObject(apiResult, schema) ?? {}
    if(id) objectIds.push(id);

    for (const [key, value] of Object.entries(apiResult)) {
      if (typeof value === "object" || Array.isArray(value)) {
        analyzeApiResult(value, objectIds, schema?.properties?.[key]);
      }
    }
  }
  return objectIds;
};

export const findIdOfObject = (object: JSONObject, schema?: Schema): { key: string; id: string } | undefined => {
  let idKey = "id";
  if (schema) {
    idKey = schema.id
  }
  for (const [key, value] of Object.entries(object)) {
    if (key !== idKey) continue;
    if (typeof value !== "string") {
      throw new Error("id must be a string")
    }
    return { key, id: value };
  }
}