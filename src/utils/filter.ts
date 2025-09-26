import {  Json, ApiSchema } from "@/utils/types";
import { findIdentifierOfObject } from "./analyze-api-result";
import crypto from "crypto";
import { JSONPath } from "jsonpath-plus";

function replaceNthChar(str: string, index: number, replacement: string = "*") {
  if (index < 0 || index >= str.length) return str; // out of bounds
  return str.substring(0, index) + replacement + str.substring(index + 1);
}

const SECRET = "23423435wtzegjsfdvsueiwrregfvd";

function pseudonymize(data: string): string {
  if (!SECRET) throw new Error("Pseudonymization secret not set");
  return crypto.createHmac("sha256", SECRET).update(data, "utf8").digest("hex");
}

export type AccessStrategies = Record<string, "deny" | "permit" | undefined>;
export type AccessRights = Record<string, string[][] | undefined>;
export type DigitAccess = Record<
  string,
  Record<string, { digitFrom: number, digitTo: number }[] | undefined> | undefined
>;
export type Pseudonymization = Record<string, Record<string, string[]> | undefined>;

interface FilterProps {
  accessStrategies: AccessStrategies;
  /* The access file. */
  accessRights: AccessRights;
  inheritedAccessRights?: string[][];
  recursiveAccess?: boolean;
  digitsAccess: DigitAccess;
  pseudonymization: Pseudonymization;
  /* The object to filter. */
  obj: Json;
  /* The schema of the object. */
  schema?: ApiSchema | ApiSchema[];
  /* The current path to the object. */
  path?: string;
  /* The logs to be appended to. */
  logs?: string[];
}

export const filter = ({
  accessStrategies,
  accessRights,
  inheritedAccessRights = [],
  pseudonymization,
  digitsAccess,
  recursiveAccess = false,
  obj,
  schema,
  path = "",
  logs = [],
}: FilterProps): { logs: string[]; obj: Json } => {
  const inheritedAccessHasRecursiveAccess = inheritedAccessRights
    ?.filter((r) => r.length === 1)
    .map((r) => r[0])
    .includes("**")
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const matchingSchema = Array.isArray(schema) ? findMatchingSchema(obj[i], schema) : schema;
      filter({
        accessStrategies,
        accessRights,
        recursiveAccess: recursiveAccess ? true : inheritedAccessHasRecursiveAccess,
        inheritedAccessRights: adjustAccessRights(
          inheritedAccessRights?.filter((r) => r[0] === String(i) || r[0] === "*") ?? [],
        ),
        pseudonymization,
        digitsAccess,
        obj: obj[i],
        schema: matchingSchema,
        path: `${path}[${i}]`,
        logs,
      });
    }
  } else if (typeof obj === "object" && obj !== null) {
    if (Array.isArray(schema)) throw new Error("Multiple schemas only allowed for arrays");
    if (schema?.type !== "object") throw new Error("Invalid schema");
    const identifier = findIdentifierOfObject(obj, schema);
    const id = identifier?.type === "id" ? identifier.id : undefined;

    const attributeAccessRights = id ? accessRights[id] : undefined;

    const accessRightsHasRecursiveAccess = attributeAccessRights
      ?.filter((r) => r.length === 1)
      .map((r) => r[0])
      .includes("**")

    if (accessRightsHasRecursiveAccess || inheritedAccessHasRecursiveAccess) {
      recursiveAccess = true;
    }

    //
    // APPLY PSEUDONYMIZATION
    //
    const readPseudonymization = id ? pseudonymization[id] : undefined;
    if (readPseudonymization) {
      for (const [key, value] of Object.entries(readPseudonymization)) {
        let toPseudonymize = "";
        for (const pseudonymizationKey of value) {
          toPseudonymize += obj[pseudonymizationKey] || "";
        }
        obj[key] = pseudonymize(toPseudonymize);
        logs.push(
          `added pseudonymization ${key} for ${value.join(", ")} (${toPseudonymize} => ${pseudonymize(toPseudonymize)})`,
        );
      }
    }

    //
    // LOOP OVER ALL ATTRIBUTES OF THE OBJECT
    //
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "object" || Array.isArray(value)) {
        const propertySchema = schema.properties?.[key]
        if (propertySchema && (propertySchema.type === "array" && !Array.isArray(value))) throw new Error("Invalid array schema for object");
        if (propertySchema && (propertySchema.type === "object" && typeof value !== "object")) throw new Error("Invalid object schema for array");
        filter({
          accessStrategies,
          accessRights,
          recursiveAccess,
          pseudonymization,
          inheritedAccessRights: adjustAccessRights(
            [...(attributeAccessRights ?? []), ...inheritedAccessRights]?.filter((r) => r[0] === key || r[0] === "*") ??
            [],
          ),
          digitsAccess,
          obj: value,
          schema: propertySchema?.type === "array" ? propertySchema.items : propertySchema,
          path: [path, key].filter(Boolean).join("."),
          logs,
        });
        continue;
      }

      // skip pseudonym
      if (readPseudonymization && Object.keys(readPseudonymization).includes(key)) continue;
      // id key may be removed for missing access rights to it, otherweise: if (key === idKey) continue;

      //
      // ENFORCE READ ACCESS OF ATTRIBUTE
      //
      const accessRightsIncludeKey = attributeAccessRights
        ?.filter((r) => r.length === 1)
        .map((r) => r[0])
        .some((k) => k === key || k === "*");

      const inheritedAccessRightsIncludeKey = inheritedAccessRights
        ?.filter((r) => r.length === 1)
        .map((r) => r[0])
        .some((k) => k === key || k === "*");


      const strategy = id ? accessStrategies[id] : undefined;
      const readAccess = strategy === "deny" ? !accessRightsIncludeKey : accessRightsIncludeKey;
      if (!readAccess && !inheritedAccessRightsIncludeKey && !recursiveAccess) {
        obj[key] = null;
        logs.push(`remove ${[path, key].filter(Boolean).join(".")} due to missing read access`);
        //continue;
      }

      //
      // ENFORCE DIGITS ACCESS OF ATTRIBUTE
      //
      const digitsReadAccess = id ? digitsAccess[id]?.[key] : undefined;
      if (digitsReadAccess && digitsReadAccess.length > 0) {
        if (!value || (typeof value === "number" && typeof value !== "number")) continue;

        let valueString = value.toString();
        for (let i = 1; i <= valueString.length; i++) {
          if (
            digitsReadAccess.some(
              (accessRule) => i >= accessRule.digitFrom && i <= accessRule.digitTo,
            )
          ) {
            continue;
          }
          valueString = replaceNthChar(valueString, i - 1);
        }
        obj[key] = valueString;
      }
    }
  }
  return { logs, obj };
};

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

export const adjustAccessRights = (accessRights: string[][]): string[][] => {
  return accessRights?.filter((rule) => rule.length > 1).map((rule) => rule.slice(1));
};

export const transformProperties = (properties: string[], object: Json): string[][] => {
  return properties.flatMap((readProperty) => {
    if (readProperty.startsWith("$")) {
      // expect jsonpath - convert PathComponent[] to string[] for each path
      if (!object) return [];
      return (JSONPath({ json: object, path: readProperty, resultType: "pointer" })).map((pointer: string) => pointer.split("/").slice(1))
    }
    if (readProperty.includes(".")) {
      // expect dot notation - return as single path array
      return [readProperty.split(".")];
    }
    // return as single path array
    return [[readProperty]];
  });
};
