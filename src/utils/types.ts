import z from "zod";
import { AccessFileSchema, AccessRuleSchema, ApiSchemaSchema } from "./schema";



export type AccessRule = z.infer<typeof AccessRuleSchema>;
export type AccessFile = z.infer<typeof AccessFileSchema>;
export type ApiSchema = z.infer<typeof ApiSchemaSchema>;


type TransformedAccessRule = Omit<AccessRule, 'identityProperties'> & {
  identityProperties: Omit<AccessRule['objectProperties'], 'readProperties' | 'writeProperties' | 'shareReadProperties' | 'shareWriteProperties'> & {
    readProperties: string[][];
    writeProperties: string[][];
    shareReadProperties: string[][];
    shareWriteProperties: string[][];
  };
};

export type TransformedAccessFile = TransformedAccessRule[];

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

export type ObjectIdentifierAndAttributes = ObjectIdentifier & { attributes: string[] };
export type ObjectIdentifier = { type: "class"; class: string } | { type: "id"; key: string; id: string; class?: string }