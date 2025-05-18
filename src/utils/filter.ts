import { AccessFile, Json } from "@/utils/types";

/**
 * Filters the given object based on the access file rules.
 * @param logs An array to store logs.
 * @param access The access file.
 * @param obj The object to filter.
 * @param parentPath The parent path of the object.
 * @param filteredObjRef The reference to the filtered object.
 * @param index The index of the object in the parent array.
 */
export const filter = (
  logs: string[],
  access: AccessFile,
  obj: Json,
  filteredObjRef: Json,
  parentPath: string,
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
          typeof filteredObjRef !== "object" ||
          Array.isArray(filteredObjRef) ||
          !Array.isArray(filteredObjRef?.[key])
        ) {
          continue;
        }
        filter(logs, access, value[i], filteredObjRef[key][i], path, i);
      }
    } else if (typeof value === "object" && value !== null) {
      if (typeof filteredObjRef !== "object" || Array.isArray(filteredObjRef)) {
        continue;
      }
      filter(logs, access, value, filteredObjRef?.[key], path);
    } else {
      const rule = access.access_rules.find((rule) => {
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

      if (
        !filteredObjRef ||
        typeof filteredObjRef !== "object" ||
        Array.isArray(filteredObjRef)
      ) {
        continue;
      }

      filteredObjRef[key] = null;
      logs.push(`remove ${path} due to missing read access`);
    }
  }
  return { logs };
};
