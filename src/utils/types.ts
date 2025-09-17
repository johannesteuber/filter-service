type AccessRule = {
  objectId: string;
  objectEntityClass: string;
  identityId: string;
  path?: string;
  identityProperties: {
    readProperties: string[];
    readStrategy: "permit" | "deny";
    writeProperties: string[];
    shareReadProperties: string[];
    shareWriteProperties: string[];
  };
  digitsAccess?: {
    property: string,
    readableDigits: {
      readableDigitsFrom: number,
      readableDigitsTo: number
    }[],
    type: "readProperties" | "writeProperties" | "shareReadProperties" | "shareWriteProperties"
  }[],
  readPseudonymization: Record<string, string[]>
};

export type AccessFile = AccessRule[];

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
  | StringSchema
  | IntegerSchema;

type StringSchema = {
  type: "string";
};

type IntegerSchema = {
  type: "integer";
};


type ObjectSchema = {
  type: "object";
  uniqueIdentifier: string | null;
  properties?: Record<string, Schema>;
};

type ArraySchema = {
  type: "array";
  items: Schema | Schema;
};