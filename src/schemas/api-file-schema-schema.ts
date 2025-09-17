import * as z from "zod";


const StringSchemaSchema = z.object({
  type: z.literal("string"),
});

const IntegerSchemaSchema = z.object({
  type: z.literal("integer"),
});

const ObjectSchemaSchema = z.object({
  type: z.literal("object"),
  uniqueIdentifier: z.string().optional(),
  objectClass: z.string(),
  get properties() {
    return z.record(z.string(), ApiSchemaSchema).optional()
  },
});

const ArraySchemaSchema = z.object({
  type: z.literal("array"),
  get items() {
    return z.union([ApiSchemaSchema, z.array(ApiSchemaSchema)]);
  }
});


export const ApiSchemaSchema = z.union([
  StringSchemaSchema,
  IntegerSchemaSchema,
  ObjectSchemaSchema,
  ArraySchemaSchema,
]);

export const ApiSchemaFileSchema = z.union([
  z.undefined(),
  ApiSchemaSchema
]);

