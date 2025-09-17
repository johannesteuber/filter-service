import { JSONPath } from "jsonpath-plus";
import { Json } from "../types/types";
import crypto from "crypto";
import { AccessRights, DigitiAccessDefinition } from "./filter";

export const accessRightForPath = (currentPath: string, accessRights: string[]): boolean => {
  const currentPathParts = currentPath.split(".");
  let matchingAccessRights = accessRights.map((r) => r.split("."));
  for (let i = 0; i < currentPathParts.length; i++) {
    if (matchingAccessRights.find((r) => r[i] === "**")) {
      return true;
    }
    const currentPathPart = currentPathParts[i];
    matchingAccessRights = matchingAccessRights.filter((r) => r[i] === currentPathPart || r[i] === "*");
  }

  if (matchingAccessRights.filter((m) => m.length === currentPathParts.length).length > 0) {
    return true;
  }
  return false;
};

export const evalJSONPathExpressions = (accessRights: AccessRights, object: Json): AccessRights => {
  return Object.fromEntries(
    Object.entries(accessRights).map(([key, value]) => [
      key,
      value?.flatMap((readProperty) => {
        if (readProperty.startsWith("$")) {
          if (!object) return [];
          return JSONPath({ json: object, path: readProperty, resultType: "pointer" }).map(
            (pointer: string) => pointer.replaceAll("/", ".").substring(1), //remove leading dot
          );
        }
        return readProperty;
      }),
    ]),
  );
};

export const replaceNthChar = (str: string, index: number, replacement: string = "*") => {
  if (index < 0 || index >= str.length) return str; // out of bounds
  return str.substring(0, index) + replacement + str.substring(index + 1);
};

const SECRET = "23423435wtzegjsfdvsueiwrregfvd";

export const pseudonymize = (data: string): string => {
  if (!SECRET) throw new Error("Pseudonymization secret not set");
  return crypto.createHmac("sha256", SECRET).update(data, "utf8").digest("hex");
};

export const mask = (
  toMask: string,
  digitAccess: DigitiAccessDefinition[],
): { maskedCharacters: number[]; maskedString: string } => {
  const maskedCharacters: number[] = [];
  for (let i = 1; i <= toMask.length; i++) {
    if (digitAccess.some((accessRule) => i >= accessRule.digitFrom && i <= accessRule.digitTo)) {
      continue;
    }
    toMask = replaceNthChar(toMask, i - 1);
    maskedCharacters.push(i);
  }
  return { maskedCharacters, maskedString: toMask };
};
