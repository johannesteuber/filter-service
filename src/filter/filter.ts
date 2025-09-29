import { Json, ApiSchema, AccessRights } from "@/types/types";
import { mergePath, traverseDocument } from "./traverse-document";
import { accessRightForPath, evalJSONPathExpressions, mask, pseudonymize } from "./filter-utilis";

export const filter = (obj: Json, accessRights: AccessRights, schema?: ApiSchema): { logs: string[]; obj: Json } => {
  const logs: string[] = [];
  const allowedProperties: string[] = [];
  accessRights = evalJSONPathExpressions(accessRights, obj);
  traverseDocument(obj, schema, (object) => {
    const id = object.accessTarget.id;
    const objectClass = object.accessTarget.class;
    const objectAccess = accessRights.find(
      (r) => (id && r.objectId === id) || (objectClass && r.objectClass === objectClass),
    );
    const objectPropertyAccess = objectAccess?.propertyAccess;

    // add access rights for this object to allowed properties and prefix with current path
    // e.g. if current path is certificate.1 and its access rights allow access to name and link, then certificate.1.name and certificate.1.link should be added to allowedProperties
    allowedProperties.push(...(objectPropertyAccess?.map((r) => mergePath(object.path, r)) ?? []));

    //
    // APPLY PSEUDONYMIZATION
    //
    const objectPseudonymization = objectAccess?.pseudonymization;
    if (objectPseudonymization) {
      for (const [key, value] of Object.entries(objectPseudonymization)) {
        let p = "";
        for (const pseudonymizationKey of value) p += object.ref[pseudonymizationKey] || "";
        object.ref[key] = pseudonymize(p);
        logs.push(`added pseudonymization ${key} for ${value.join(", ")}`);
      }
    }

    const objectDigitsAccess = objectAccess?.digitsAccess;

    return (property) => {
      // skip access control for pseudonyms added in "APPLY PSEUDONYMIZATION" step
      if (objectPseudonymization && Object.keys(objectPseudonymization).includes(property.key)) return;

      //
      // ENFORCE READ ACCESS OF PROPERTY
      //
      const accessRightsIncludePath = accessRightForPath(property.path, allowedProperties);

      if (!accessRightsIncludePath) {
        object.ref[property.key] = null;
        logs.push(`access denied for ${property.path}`);
        return;
      }
      logs.push(`access granted for ${property.path}`);

      //
      // ENFORCE DIGITS ACCESS OF PROPERTY
      //
      const propertyDigitsAccess = objectDigitsAccess?.[property.key];
      if (propertyDigitsAccess && propertyDigitsAccess.length > 0) {
        // currently digits read access is also applied to numbers, if this is not intended adjust the following line
        if (typeof property.value !== "string" && typeof property.value !== "number") return;

        const valueString = property.value.toString();
        const { maskedCharacters, maskedString } = mask(valueString, propertyDigitsAccess);
        object.ref[property.key] = maskedString;
        logs.push(`masked characters ${maskedCharacters.join(", ")} for ${property.path}`);
      }
    };
  });
  return { logs, obj };
};
