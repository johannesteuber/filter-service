export const filter = ({
  accessRules,
  obj,
  schema,
}: FilterProps): JSON => {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      filter({ accessRules, obj: obj[i], schema });
    }
  } else if (typeof obj === "object" && obj !== null) {
    const { id, key: idKey } = findIdOfObject(obj, schema);
    const rule = accessRules.find((r) => r.objectId === id);
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "object" || Array.isArray(value)) {
        filter({
          accessRules,
          obj: value,
          schema: schema?.properties?.[key],
        });
      } else {
        if (key === idKey) continue;
        const readAccess = rule?.readProperties.includes(key);
        if (!readAccess) {
          obj[key] = null;
        }
      }
    }
  }
  return obj;
};

export const findIdOfObject = (
  object: JSONObject,
  schema?: Schema
): { key: string; id: string } | undefined => {
  let idKey = "id";
  if (schema) idKey = schema.id;

  for (const [key, value] of Object.entries(object)) {
    if (key !== idKey) continue;
    if (typeof value !== "string") {
      throw new Error("id must be a string");
    }
    return { key, id: value };
  }
};
