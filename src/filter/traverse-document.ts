import { resolveAccessTarget } from "./resolve-access-target";
import { ApiSchema, Json, JSONObject, AccessTarget } from "../types/types";
import Ajv from "ajv";
const ajv = new Ajv({ strictSchema: false });

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
  schema: ApiSchema | undefined,
  objectCallback: (p: TraverseObjectCallbackProps) => TraverseObjectAttributesCallback | void,
  path = "",
  isRoot = true,
) => {
  // validate data based on schema
  if (schema && isRoot) {
    const validate = ajv.compile(schema);
    const valid = validate(obj);
    if (!valid) {
      // soft fail if data does not match schema
      console.warn("schema invalid", validate.errors);
      schema = undefined;
    }
  }

  if (Array.isArray(obj)) {
    if (schema && schema.type !== "array") throw new Error("Invalid schema, expected array");
    for (let i = 0; i < obj.length; i++) {
      const arrayItemPath = mergePath(path, String(i));
      const arrayItemSchema =
        schema?.items && ("oneOf" in schema?.items ? findMatchingSchema(obj[i], schema.items.oneOf) : schema?.items);
      traverseDocument(obj[i], arrayItemSchema, objectCallback, arrayItemPath, false);
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
      traverseDocument(value, attributeSchema, objectCallback, attributePath, false);
    }
  }
};

export const mergePath = (path: string, key: string) => [path, key].filter(Boolean).join(".");

export const findMatchingSchema = (obj: Json, schemas: ApiSchema[]): ApiSchema | undefined => {
  for (const schema of schemas) {
    const validator = ajv.compile(schema);
    if (validator(obj)) {
      return schema;
    }
  }
  console.warn("No matching schema found");
  return undefined;
};
