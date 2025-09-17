import { AccessFileSchema, AccessRuleSchema } from "@/schemas/access-rule-schema";
import { ApiSchemaFileSchema, ApiSchemaSchema } from "@/schemas/api-file-schema-schema";
import z from "zod";



export type AccessRule = z.infer<typeof AccessRuleSchema>;
export type AccessFile = z.infer<typeof AccessFileSchema>;
export type ApiSchema = z.infer<typeof ApiSchemaSchema>;

export type ApiSchemaFile = z.infer<typeof ApiSchemaFileSchema>;

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

export type AccessTarget = { id: string | undefined, class: string | undefined }