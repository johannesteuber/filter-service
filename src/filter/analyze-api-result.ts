import { traverseDocument } from "./traverse-document";
import { Json, ApiSchema, AccessTarget } from "../types/types";

export type AccessTargetWithProperties = AccessTarget & { properties: string[] };

export const analyzeApiResult = (obj: Json, schema?: ApiSchema): AccessTargetWithProperties[] => {
  const accessTargets: AccessTargetWithProperties[] = [];

  traverseDocument(obj, schema, (object) => {
    if (object.accessTarget) accessTargets.push({ ...object.accessTarget, properties: Object.keys(object.ref) }); //TODO: check for duplicates
  });
  return accessTargets;
};
