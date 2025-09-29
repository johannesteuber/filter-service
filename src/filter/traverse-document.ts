import { resolveAccessTarget } from "./resolve-access-target";
import { ApiSchema, Json, JSONObject, AccessTarget } from "../types/types";
import Ajv from "ajv";
const ajv = new Ajv({ strictSchema: false });

export type TraverseObjectCallbackProps = { accessTarget: AccessTarget; path: string; ref: JSONObject };
export type TraverseObjectPropertyCallback = ({
  key,
  path,
  value,
}: {
  key: string;
  path: string;
  value: Json;
}) => void;

export const traverseDocument = (
  doc: Json,
  schema: ApiSchema | undefined,
  objectCallback: (p: TraverseObjectCallbackProps) => TraverseObjectPropertyCallback | void,
  path = "",
  isRoot = true,
) => {
  // validate data based on schema
  if (schema && isRoot) {
    const validate = ajv.compile(schema);
    const valid = validate(doc);
    if (!valid) {
      // soft fail if data does not match schema
      console.warn("schema invalid", validate.errors);
      schema = undefined;
    }
  }

  if (Array.isArray(doc)) {
    if (schema && schema.type !== "array") throw new Error("Invalid schema, expected array");
    for (let i = 0; i < doc.length; i++) {
      const arrayItemPath = mergePath(path, String(i));
      const arrayItemSchema =
        schema?.items && ("oneOf" in schema?.items ? findMatchingSchema(doc[i], schema.items.oneOf) : schema?.items);
      traverseDocument(doc[i], arrayItemSchema, objectCallback, arrayItemPath, false);
    }
  } else if (typeof doc === "object" && doc !== null) {
    if (Array.isArray(schema)) throw new Error("Multiple schemas only allowed for arrays");
    if (schema && schema.type !== "object") throw new Error("Invalid schema, expected object");

    const accessTarget = resolveAccessTarget(doc, schema);
    const propertyCallback = objectCallback({ accessTarget, path, ref: doc });

    for (const [key, value] of Object.entries(doc)) {
      const propertyPath = mergePath(path, key);

      if (typeof value !== "object" && !Array.isArray(value)) {
        propertyCallback?.({ key, path: propertyPath, value });
        continue;
      }

      const propertySchema = schema?.properties?.[key];
      traverseDocument(value, propertySchema, objectCallback, propertyPath, false);
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
