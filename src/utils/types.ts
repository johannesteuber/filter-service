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
  | {
      [key: string]: Json;
    }
  | Json[];
