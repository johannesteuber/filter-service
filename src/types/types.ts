import { AccessRightSchema, AccessRightsSchema, DigitsAccessSchema } from "@/schemas/access-rule-schema";
import { ApiSchemaFileSchema, ApiSchemaSchema } from "@/schemas/api-file-schema-schema";
import { DatentreuAccessRightsSchema } from "@/schemas/datentreu-access-rule-schema";
import z from "zod";

export type AccessRight = z.infer<typeof AccessRightSchema>;
export type AccessRights = z.infer<typeof AccessRightsSchema>;

export type DigitsAccess = z.infer<typeof DigitsAccessSchema>;

export type ApiSchema = z.infer<typeof ApiSchemaSchema>;

export type ApiSchemaFile = z.infer<typeof ApiSchemaFileSchema>;

export type DatentreuAccessRight = z.infer<typeof DatentreuAccessRightsSchema>;

export type Json = string | number | boolean | null | undefined | JSONObject | Json[];

export type JSONObject = {
  [key: string]: Json;
};

export type AccessTarget = { objectId: string | number | undefined; objectClass: string | undefined };
