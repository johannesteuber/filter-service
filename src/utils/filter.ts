import { AccessFile, Json, Schema } from "@/utils/types";
import { findIdOfObject } from "./analyze-api-result";

interface FilterProps {
  /* The access file. */
  access: AccessFile;
  /* The object to filter. */
  obj: Json;
  /* The schema of the object. */
  schema?: Schema;
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
      filter({ access, obj: obj[i], schema, path: `${path}[${i}]`, logs });
    }
  } else if (typeof obj === "object" && obj !== null) {
    const { id, key: idKey } = findIdOfObject(obj, schema) ?? {};
    const rule = access.access_rules.find((rule) => rule.objectId === id);

    for (const [key, value] of Object.entries(obj)) {
      if (key === idKey) continue;
      const readAccess = rule?.identityProperties.readProperties.includes(key);
      if (!readAccess) {
        obj[key] = null;
        logs.push(`remove ${[path, key].filter(Boolean).join(".")} due to missing read access`);
        continue;
      }
      if (typeof value === "object" || Array.isArray(value)) {
        filter({
          access,
          obj: value,
          schema: schema?.properties?.[key],
          path: [path, key].filter(Boolean).join("."),
          logs,
        });
      }
    }
  }
  return { logs, obj };
};
