import { Json, ApiSchema } from "@/types/types";
import { mergePath, traverseDocument } from "./traverse-document";
import { accessRightForPath, evalJSONPathExpressions, mask, pseudonymize } from "./filter-utilis";

export type AccessRights = Record<string, string[] | undefined>;
export type DigitAccess = Record<string, Record<string, DigitiAccessDefinition[] | undefined> | undefined>;
export type DigitiAccessDefinition = { digitFrom: number; digitTo: number };
export type Pseudonymization = Record<string, Record<string, string[]> | undefined>;

export interface FilterProps {
  accessRights: AccessRights;
  digitsAccess: DigitAccess;
  pseudonymization: Pseudonymization;
  obj: Json;
  schema?: ApiSchema | ApiSchema[];
}

export const filter = ({
  accessRights,
  pseudonymization,
  digitsAccess,
  obj,
  schema,
}: FilterProps): { logs: string[]; obj: Json } => {
  const logs: string[] = [];
  const allowedAttributes: string[] = [];
  accessRights = evalJSONPathExpressions(accessRights, obj);

  traverseDocument(obj, schema, (object) => {
    const id = object.accessTarget.id;
    const objectClass = object.accessTarget.class;
    const attributeAccessRights =
      accessRights[`${id}`] ?? accessRights[`${objectClass}.${id}`] ?? accessRights[`${objectClass}`];

    // add access rights for this object to allowed attributes and prefix with current path
    // e.g. if current path is certificate.1 and its access rights allow access to name and link, then certificate.1.name and certificate.1.link should be added to allowedAttributes
    allowedAttributes.push(...(attributeAccessRights?.map((r) => mergePath(object.path, r)) ?? []));

    //
    // APPLY PSEUDONYMIZATION
    //
    const readPseudonymization = id ? pseudonymization[id] : undefined;
    if (readPseudonymization) {
      for (const [key, value] of Object.entries(readPseudonymization)) {
        let p = "";
        for (const pseudonymizationKey of value) p += object.ref[pseudonymizationKey] || "";
        object.ref[key] = pseudonymize(p);
        logs.push(`added pseudonymization ${key} for ${value.join(", ")}`);
      }
    }

    return (attribute) => {
      console.log("attribute", attribute.key)
      // skip access control pseudonyms added in "APPLY PSEUDONYMIZATION" step
      if (readPseudonymization && Object.keys(readPseudonymization).includes(attribute.key)) return;

      //
      // ENFORCE READ ACCESS OF ATTRIBUTE
      //
      const accessRightsIncludePath = accessRightForPath(attribute.path, allowedAttributes);

      if (!accessRightsIncludePath) {
        object.ref[attribute.key] = null;
        logs.push(`access denied for <i>${attribute.path}</i>`);
        return;
      }
      logs.push(`access granted for <i>${attribute.path}</i>`);

      //
      // ENFORCE DIGITS ACCESS OF ATTRIBUTE
      //
      const digitsReadAccess = id ? digitsAccess[id]?.[attribute.key] : undefined;
      if (digitsReadAccess && digitsReadAccess.length > 0) {
        // currently digits read access is also applied to numbers, if this is not intended adjust the following line
        if (typeof attribute.value !== "string" && typeof attribute.value !== "number") return;

        const valueString = attribute.value.toString();
        const { maskedCharacters, maskedString } = mask(valueString, digitsReadAccess);
        object.ref[attribute.key] = maskedString;
        logs.push(`masked characters ${maskedCharacters.join(", ")} for ${attribute.path}`);
      }
    };
  });

  return { logs, obj };
};
