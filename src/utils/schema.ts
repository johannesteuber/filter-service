import * as z from "zod";

export const AccessRuleSchema = z.object({
  objectId: z.string(),
  objectEntityClass: z.string(),
  identityId: z.string(),
  objectProperties: z.object({
    readProperties: z.array(z.string()),
    readStrategy: z.enum(["permit", "deny"]).optional(),
    writeProperties: z.array(z.string()).optional(),
    shareReadProperties: z.array(z.string()).optional(),
    shareWriteProperties: z.array(z.string()).optional(),
  }),
  digitsAccess: z
    .array(
      z.object({
        property: z.string(),
        readableDigits: z.array(
          z.object({
            readableDigitsFrom: z.number(),
            readableDigitsTo: z.number(),
          }),
        ),
        type: z.enum([
          "readProperties",
          "writeProperties",
          "shareReadProperties",
          "shareWriteProperties",
        ]),
      }),
    )
    .optional(),
  pseudonymization: z.record(z.string(), z.array(z.string())).optional(),
});


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

export const AccessFileSchema = z.array(AccessRuleSchema);
