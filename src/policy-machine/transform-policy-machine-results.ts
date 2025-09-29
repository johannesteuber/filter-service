import { DatentreuAccessBody } from "@/app/actions/datentreu-access";
import { AccessRight, AccessRights, DatentreuAccessRight, DigitsAccess } from "@/types/types";

export const transformPolicyMachineAccessRights = (
  accessRightsFile: DatentreuAccessRight[],
  type: "readProperties",
): AccessRights => {
  return accessRightsFile.map(
    (accessRight) =>
      ({
        objectId: accessRight.objectId,
        objectClass: accessRight.objectEntityClass,
        propertyAccess: accessRight.objectProperties[type],
        digitsAccess: accessRight.objectProperties.digitsAccess
          ?.filter((d) => d.type === type)
          ?.reduce(
            (acc, digitAccess) => ({
              ...acc,
              [digitAccess.property]: digitAccess.readableDigits.map((d) => ({
                digitFrom: d.readableDigitsFrom,
                digitTo: d.readableDigitsTo,
              })),
            }),
            {} as DigitsAccess,
          ),
        pseudonymization: accessRight.objectProperties.pseudonymization,
      }) as AccessRight,
  );
};

export const transformToPolicyMachine = (accessRight: AccessRight): DatentreuAccessBody => {
  return {
    readProperties: accessRight.propertyAccess ?? [],
    writeProperties: [],
    shareReadProperties: [],
    shareWriteProperties: [],
    digitsAccess: Object.entries(accessRight.digitsAccess ?? {}).map(([key, value]) => ({
      property: key,
      readableDigits: value.map((d) => ({ readableDigitsFrom: d.digitFrom, readableDigitsTo: d.digitTo })),
      type: "readProperties",
    })),
  };
};
