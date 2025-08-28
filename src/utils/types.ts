type AccessRule = {
  objectId: string;
  objectEntityClass: string;
  identityId: string;
  path?: string;
  identityProperties: {
    readProperties: string[];
    writeProperties: string[];
    shareReadProperties: string[];
    shareWriteProperties: string[];
  };
};

export type AccessFile = {
  access_rules: AccessRule[];
};

export type Json =
  | string
  | number
  | boolean
  | null
  | undefined
  | JSONObject
  | Json[];

export type JSONObject = {
  [key: string]: Json;
}

export type Schema =
  | ObjectSchema
  | ArraySchema


type ObjectSchema = {
  type: "object";
  id: string;
  properties?: Record<string, Schema>;
};

type ArraySchema = {
  type: "array";
  id: string;
  properties?: Record<string, Schema>;
};