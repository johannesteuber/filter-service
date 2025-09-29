import { traverseDocument } from "./traverse-document";
import { Json, ApiSchema, AccessTarget } from "../types/types";

export type AccessTargetWithAttributes = AccessTarget & { attributes: string[] };

export const analyzeApiResult = (obj: Json, schema?: ApiSchema): AccessTargetWithAttributes[] => {
  const accessTargets: AccessTargetWithAttributes[] = [];

  traverseDocument(obj, schema, (object) => {
    if (object.accessTarget) accessTargets.push({ ...object.accessTarget, attributes: Object.keys(object.ref) }); //TODO: check for duplicates
  });
  return accessTargets;
};
