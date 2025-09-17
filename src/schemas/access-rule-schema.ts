import * as z from "zod";

export const AccessRuleSchema = z.object({
  objectId: z.string(),
  objectEntityClass: z.string(),
  identityId: z.string(),
  objectProperties: z.object({
    readProperties: z.array(z.string()),
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

export const AccessFileSchema = z.array(AccessRuleSchema);
