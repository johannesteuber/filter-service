import { AccessFile, Json, Schema } from "@/utils/types";
import { findIdOfObject } from "./analyze-api-result";
import crypto from 'crypto';

function replaceNthChar(str: string, index: number, replacement: string = "*") {
  if (index < 0 || index >= str.length) return str; // out of bounds
  return str.substring(0, index) + replacement + str.substring(index + 1);
}

const SECRET = "23423435wtzegjsfdvsueiwrregfvd";

function pseudonymize(data: string): string {
  if (!SECRET) throw new Error("Pseudonymization secret not set");
  return crypto
    .createHmac('sha256', SECRET)
    .update(data, 'utf8')
    .digest('hex');
}

interface FilterProps {
  /* The access file. */
  access: AccessFile;
  /* The object to filter. */
  obj: Json;
  /* The schema of the object. */
  schema?: Schema | Schema[];
  /* The current path to the object. */
  path?: string;
  /* The logs to be appended to. */
  logs?: string[];
}

export const filter = ({
  access,
  obj,
  schema,
  path = "",
  logs = [],
}: FilterProps): { logs: string[]; obj: Json } => {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const matchingSchema = Array.isArray(schema) ? findMatchingSchema(obj[i], schema) : schema
      filter({ access, obj: obj[i], schema: matchingSchema, path: `${path}[${i}]`, logs });
    }
  } else if (typeof obj === "object" && obj !== null) {
    if (Array.isArray(schema)) throw new Error("Invalid schema");
    const { id, key: idKey } = findIdOfObject(obj, schema) ?? {};
    const rule = access.find((rule) => rule.objectId === id);

    const readPseudonymization = rule?.pseudonymization
    if (readPseudonymization) {
      for (const [key, value] of Object.entries(readPseudonymization)) {
        let toPseudonymize = "";
        for (const pseudonymizationKey of value) {
          toPseudonymize += obj[pseudonymizationKey] || "";
        }
        obj[key] = pseudonymize(toPseudonymize);
        logs.push(`added pseudonymization ${key} for ${value.join(", ")} (${toPseudonymize} => ${pseudonymize(toPseudonymize)})`);

      }
    }

    for (const [key, value] of Object.entries(obj)) {

      if (typeof value === "object" || Array.isArray(value)) {
        if (schema && (schema.type !== "array" && schema.type !== "object")) throw new Error("Invalid schema");
        filter({
          access,
          obj: value,
          schema: schema?.type === "array" ? schema.items : schema?.properties?.[key],
          path: [path, key].filter(Boolean).join("."),
          logs,
        });
        continue;
      }
      if (readPseudonymization && Object.keys(readPseudonymization).includes(key)) continue;
      // id key may be removed for missing access rights to it, otherweise: if (key === idKey) continue;
      const readPropertiesIncludedKey = rule?.identityProperties.readProperties.includes(key);
      const readStrategy = rule?.identityProperties.readStrategy
      const readAccess = readStrategy === "deny" ? !readPropertiesIncludedKey : readPropertiesIncludedKey
      if (!readAccess) {
        obj[key] = null;
        logs.push(`remove ${[path, key].filter(Boolean).join(".")} due to missing read access`);
        //continue;
      }
      const digitsReadAccess = rule?.digitsAccess?.find((accessRule) => accessRule.property === key && accessRule.type === "readProperties")?.readableDigits;
      if (digitsReadAccess && digitsReadAccess.length > 0) {
        if (!value || (typeof value === "number" && typeof value !== "number")) continue;

        let valueString = value.toString();
        for (let i = 1; i <= valueString.length; i++) {
          if (digitsReadAccess.some((accessRule) => i >= accessRule.readableDigitsFrom && i <= accessRule.readableDigitsTo)) {
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

export const findMatchingSchema = (obj: Json, schemas: Schema[]): Schema => {
  schemaLoop:
  for (const schema of schemas) {
    if (schema.type === "string" && typeof obj === "string") return schema;
    if (schema.type === "integer" && typeof obj === "number") return schema;
    //if (schema.type === "boolean" && typeof obj === "boolean") return schema;
    if (schema.type === "object") {
      if (typeof obj !== "object" || obj === null) continue;
      for (const [key, value] of Object.entries(obj)) {
        if (!schema.properties?.[key]) continue schemaLoop;
      }
    }
    return schema
  }
  throw new Error("No matching schema found")
}
