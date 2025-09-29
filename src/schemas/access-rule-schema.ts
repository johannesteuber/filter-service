import * as z from "zod";

export const DigitsAccessSchema = z.record(
  z.string(),
  z.array(z.object({ digitFrom: z.number(), digitTo: z.number() })),
);

export const AccessRightSchema = z.object({
  objectId: z.optional(z.union([z.string(), z.number()])),
  objectClass: z.optional(z.string()),
  propertyAccess: z.optional(z.array(z.string())),
  digitsAccess: z.optional(DigitsAccessSchema),
  pseudonymization: z.optional(z.record(z.string(), z.array(z.string()))),
});

export const AccessRightsSchema = z.array(AccessRightSchema);
