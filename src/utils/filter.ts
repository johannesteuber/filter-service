type AccessRule = {
  objectId: string;
  objectEntityClass: string;
  identityId: string;
  path?: string;
  identityProperties: {
    readProperties: string[];
    writeProperties: string[];
    shareReadProperties: string[];
    shareWriteProperties: string[];
  };
};

export type AccessFile = {
  access_rules: AccessRule[];
};

export type Json =
  | string
  | number
  | boolean
  | null
  | undefined
  | {
      [key: string]: Json;
    }
  | Json[];

export const filter = (
  logs: string[],
  accessFull: AccessFile,
  obj: Json,
  parentPath: string,
  objRef: Json,
  index?: number,
) => {
  for (const [key, value] of Object.entries(obj ?? {})) {
    const path = [
      `${parentPath}${index || index === 0 ? `[${index}]` : ""}`,
      key,
    ]
      .filter(Boolean)
      .join(".");

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (
          typeof objRef !== "object" ||
          Array.isArray(objRef) ||
          !Array.isArray(objRef?.[key])
        ) {
          continue;
        }
        filter(logs, accessFull, value[i], path, objRef[key][i], i);
      }
    } else if (typeof value === "object" && value !== null) {
      if (typeof objRef !== "object" || Array.isArray(objRef)) {
        continue;
      }
      filter(logs, accessFull, value, path, objRef?.[key]);
    } else {
      const rule = accessFull.access_rules.find((rule) => {
        if (parentPath) {
          const correctPath = rule.path === parentPath;
          if (index || index === 0) {
            //parent is array
            if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
              return;
            }

            const ids = [obj.id, obj.ingredientId];
            return correctPath && ids.includes(rule.objectId);
          }
          return correctPath;
        }
        return rule.path === undefined;
      });

      const readAccess = rule?.identityProperties.readProperties.includes(key);

      if (readAccess || key === "id" || key === "ingredientId") {
        continue;
      }

      if (!objRef || typeof objRef !== "object" || Array.isArray(objRef)) {
        continue;
      }

      objRef[key] = null;
      logs.push(`remove ${path} due to missing read access`);
    }
  }
  return { logs };
};
