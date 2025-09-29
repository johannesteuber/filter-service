import { Json, ApiSchema, AccessRights } from "@/types/types";
import { mergePath, traverseDocument } from "./traverse-document";
import { accessRightForPath, evalJSONPathExpressions, findMatchingAccessRights, mask, pseudonymize } from "./filter-utilis";

export const filter = (doc: Json, accessRights: AccessRights, schema?: ApiSchema): { logs: string[]; doc: Json } => {
  const logs: string[] = [];
  const allowedProperties: string[] = [];
  accessRights = evalJSONPathExpressions(accessRights, doc);
  traverseDocument(doc, schema, (object) => {
    const objectAccess = findMatchingAccessRights(accessRights, object.accessTarget)
    const objectPropertyAccess = objectAccess?.propertyAccess;
    const objectDigitsAccess = objectAccess?.digitsAccess;
    const objectPseudonymization = objectAccess?.pseudonymization;

    // add access rights for this object to allowed properties and prefix with current path
    // e.g. if current path is certificate.1 and its access rights allow access to name and link, then certificate.1.name and certificate.1.link should be added to allowedProperties
    allowedProperties.push(...(objectPropertyAccess?.map((r) => mergePath(object.path, r)) ?? []));

    //
    // APPLY PSEUDONYMIZATION
    //
    if (objectPseudonymization) {
      for (const [key, value] of Object.entries(objectPseudonymization)) {
        const toPseudonymize = value.map((key) => object.ref[key] || "").join("");
        object.ref[key] = pseudonymize(toPseudonymize);
        logs.push(`added pseudonymization ${key} for ${value.join(", ")}`);
      }
    }

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
  return { logs, doc };
};
