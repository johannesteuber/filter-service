export const filter = ({
  accessRules,
  obj,
}: FilterProps): JSON => {
  if (isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      filter({ accessRules, obj: obj[i] });
    }
  } else if (typeof obj === "object" && obj !== null) {
    const { id, key: idKey } = findIdOfObject(obj);
    const rule = accessRules.find((r) => r.objectId === id);

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "object" || isArray(value)) {
        filter({ accessRules, obj: value });
      } else {
        if (key === idKey) continue;
        const readAccess =
          rule?.readProperties.includes(key);
        if (!readAccess) obj[key] = null;
      }
    }
  }
  return obj;
};

export const findIdOfObject = (
  object: JSONObject
): { key: string; id: string } | undefined => {
  let idKey = "id";

  for (const [key, value] of Object.entries(object)) {
    if (key !== idKey) continue;
    if (typeof value !== "string") {
      throw new Error("id must be a string");
    }
    return { key, id: value };
  }
};
