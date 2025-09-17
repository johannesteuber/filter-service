import { AccessRights, DigitAccess, Pseudonymization } from "@/filter/filter"
import { AccessFile } from "@/types/types"

export const transformPolicyMachineAccessRights = (accessRightsFile: AccessFile, type: "readProperties"): AccessRights => {
  return accessRightsFile.reduce(
    (acc, rule) => ({
      ...acc,
      [rule.objectId]: rule.objectProperties[type],
    }),
    {} as AccessRights,
  )
}

export const transformPolicyMachineDigitsAccess = (accessRightsFile: AccessFile, type: "readProperties"): DigitAccess => {
  return accessRightsFile.reduce(
    (acc, rule) => ({
      ...acc,
      [rule.objectId]: rule.digitsAccess
        ?.filter((d) => d.type === type)
        .reduce(
          (acc, d) => ({
            ...acc,
            [d.property]: d.readableDigits.map((d) => ({
              digitFrom: d.readableDigitsFrom,
              digitTo: d.readableDigitsTo,
            })),
          }),
          {} as DigitAccess[string],
        ),
    }),
    {} as DigitAccess,
  )
}

export const transformPolicyMachinePseudonymization = (accessRightsFile: AccessFile): Pseudonymization => {
  return accessRightsFile.reduce(
    (acc, rule) => ({
      ...acc,
      [rule.objectId]: rule.pseudonymization,
    }),
    {} as Pseudonymization,
  )
}