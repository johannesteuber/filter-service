import { resolveAccessTarget } from "./resolve-access-target";
import { ApiSchema, Json, JSONObject, AccessTarget } from "../types/types";

export type TraverseObjectCallbackProps = { accessTarget: AccessTarget; path: string; ref: JSONObject };
export type TraverseObjectAttributesCallback = ({
  key,
  path,
  value,
}: {
  key: string;
  path: string;
  value: Json;
}) => void;

export const traverseDocument = (
  obj: Json,
  schema: ApiSchema | ApiSchema[] | undefined,
  objectCallback: (p: TraverseObjectCallbackProps) => TraverseObjectAttributesCallback | void,
  path = "",
) => {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const arrayItemPath = mergePath(path, String(i));
      const arrayItemSchema = Array.isArray(schema) ? findMatchingSchema(obj[i], schema) : schema;
      traverseDocument(obj[i], arrayItemSchema, objectCallback, arrayItemPath);
    }
  } else if (typeof obj === "object" && obj !== null) {
    if (Array.isArray(schema)) throw new Error("Multiple schemas only allowed for arrays");
    if (schema && schema.type !== "object") throw new Error("Invalid schema, expected object");

    const accessTarget = resolveAccessTarget(obj, schema);
    const attributeCallback = objectCallback({ accessTarget, path, ref: obj });

    for (const [key, value] of Object.entries(obj)) {
      const attributePath = mergePath(path, key);

      if (typeof value !== "object" && !Array.isArray(value)) {
        attributeCallback?.({ key, path: attributePath, value });
        continue;
      }

      const attributeSchema = schema?.properties?.[key];
      const objectSchema = attributeSchema?.type === "array" ? attributeSchema.items : attributeSchema;
      traverseDocument(value, objectSchema, objectCallback, attributePath);
    }
  }
};

export const mergePath = (path: string, key: string) => [path, key].filter(Boolean).join(".");

export const findMatchingSchema = (obj: Json, schemas: ApiSchema[]): ApiSchema => {
  schemaLoop: for (const schema of schemas) {
    if (schema.type === "string" && typeof obj === "string") return schema;
    if (schema.type === "integer" && typeof obj === "number") return schema;
    //if (schema.type === "boolean" && typeof obj === "boolean") return schema;
    if (schema.type === "object") {
      if (typeof obj !== "object" || obj === null) continue;
      for (const [key] of Object.entries(obj)) {
        if (!schema.properties?.[key]) continue schemaLoop;
      }
    }
    return schema;
  }
  throw new Error("No matching schema found");
};
