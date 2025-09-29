// src/math.test.ts

import { filter } from "./filter";
import productpassport from "../../data/json/productpassport.json";
import access_full from "../../data/json/access_full.json";
import productpassport_schema from "../../data/json/productpassport.schema.json";
import { transformPolicyMachineAccessRights, transformPolicyMachineDigitsAccess, transformPolicyMachinePseudonymization } from "../policy-machine/transform-policy-machine-results";
import { AccessFileSchema } from "../schemas/access-rule-schema";
import { ApiSchemaFileSchema } from "../schemas/api-file-schema-schema";

describe("filter", () => {
  test("productpassport with correct schema and access_full.json", () => {
    const accessRights = AccessFileSchema.parse(access_full);
    const schema = ApiSchemaFileSchema.parse(productpassport_schema);
    const result = filter({
      obj: JSON.parse(JSON.stringify(productpassport)),
      accessRights: transformPolicyMachineAccessRights(accessRights, "readProperties"),
      digitsAccess: transformPolicyMachineDigitsAccess(accessRights, "readProperties"),
      pseudonymization: transformPolicyMachinePseudonymization(accessRights),
      schema,
    }).obj;

    if (typeof result !== "object") {
      throw new Error("result is not an object")
    }
    if (!result) {
      throw new Error("result is empty")
    }
    if (Array.isArray(result)) {
      throw new Error("result is an array")
    }

    expect(result["category"]).toBe("Saft")
    expect(result["productName"]).toBe("Apfel-Birnen-Saft")
    expect(result["regioDataId"]).toBe(null)
  });

  test("productpassport without schema and access_full.json", () => {
    const accessRights = AccessFileSchema.parse(access_full);
    const result = filter({
      obj: productpassport,
      accessRights: transformPolicyMachineAccessRights(accessRights, "readProperties"),
      digitsAccess: transformPolicyMachineDigitsAccess(accessRights, "readProperties"),
      pseudonymization: transformPolicyMachinePseudonymization(accessRights),
    }).obj;

    if (typeof result !== "object") {
      throw new Error("result is not an object")
    }
    if (!result) {
      throw new Error("result is empty")
    }
    if (Array.isArray(result)) {
      throw new Error("result is an array")
    }

    expect(result["category"]).toBe(null)
    expect(result["productName"]).toBe(null)
    expect(result["regioDataId"]).toBe(null)
  });
});


