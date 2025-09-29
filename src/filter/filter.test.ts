import { filter } from "./filter";
import productpassport from "../../data/json/productpassport.json";
import access_full from "../../data/json/access_full.json";
import productpassport_schema from "../../data/json/productpassport.schema.json";
import {
  transformPolicyMachineAccessRights,
  transformPolicyMachineDigitsAccess,
  transformPolicyMachinePseudonymization,
} from "../policy-machine/transform-policy-machine-results";
import { AccessFileSchema } from "../schemas/access-rule-schema";
import { ApiSchemaFileSchema } from "../schemas/api-file-schema-schema";

export function assertIsObject(value: unknown): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Value must be a non-null object and not an array");
  }
}
export function assertIsArray(value: unknown): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new Error("Value must be an array");
  }
}

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

  assertIsObject(result);

  expect(result["productBatchId"]).toBeNull();
  expect(result["productId"]).toBeNull();
  expect(result["regioDataId"]).toBeNull();
  expect(result["productionDate"]).toBe("2025-03-06T19:03:01.334");
  expect(result["bestBefore"]).toBe("2026-05-06T19:03:01.334");
  expect(result["productName"]).toBe("Apfel-Birnen-Saft");
  expect(result["productShortName"]).toBe("Saft");
  expect(result["description"]).toBe(
    "Der Saft wird regional in einer Lorem ipsum dolor sit amet, consetetur sadipscing elitr.",
  );
  expect(result["category"]).toBe("Saft");
  expect(result["imageSrc"]).toBe("https://smartfarminglab.github.io/data/flasche_stock.jpg");

  assertIsArray(result["productBatchSteps"]);
  assertIsObject(result["productBatchSteps"][0]);

  expect(result["productBatchSteps"][0]["id"]).toBeNull();
  expect(result["productBatchSteps"][0]["productBatchId"]).toBeNull();
  expect(result["productBatchSteps"][0]["name"]).toBe("Apfel Ernte");
  expect(result["productBatchSteps"][0]["previousStepId"]).toBeNull();
  expect(result["productBatchSteps"][0]["nextStepId"]).toBeNull();
  expect(result["productBatchSteps"][0]["imageSrc"]).toBe(
    "https://smartfarminglab.github.io/data/example_harvesting.jpg",
  );
  expect(result["productBatchSteps"][0]["description"]).toBe(
    "Die Äpfel wurden am Standort 'Apfelbäume' in Dippoldiswalde von Hand geerntet. Dabei wurde auf eine schonende Behandlung der Früchte geachtet, um die Qualität für die Weiterverarbeitung sicherzustellen.",
  );

  assertIsObject(result["productBatchSteps"][2]);
  assertIsArray(result["productBatchSteps"][2]["stepEntries"]);
  assertIsObject(result["productBatchSteps"][2]["stepEntries"][0]);

  expect(result["productBatchSteps"][2]["stepEntries"][0]["id"]).toBeNull();
  expect(result["productBatchSteps"][2]["stepEntries"][0]["productBatchStepId"]).toBeNull();
  expect(result["productBatchSteps"][2]["stepEntries"][0]["date"]).toBe("2025-03-08T20:57:35.582");
  expect(result["productBatchSteps"][2]["stepEntries"][0]["previousStepEntryId"]).toBeNull();
  expect(result["productBatchSteps"][2]["stepEntries"][0]["nextStepEntryId"]).toBeNull();
  expect(result["productBatchSteps"][2]["stepEntries"][0]["imageSrc"]).toBeNull();
  expect(result["productBatchSteps"][2]["stepEntries"][0]["amount"]).toBe("100");
  expect(result["productBatchSteps"][2]["stepEntries"][0]["amountUnit"]).toBe("Stück");
  expect(result["productBatchSteps"][2]["stepEntries"][0]["description"]).toBe("Flaschen spülen");
  expect(result["productBatchSteps"][2]["stepEntries"][0]["energyConsumption"]).toBeNull();
  expect(result["productBatchSteps"][2]["stepEntries"][0]["co2Emission"]).toBeNull();

  //test masking
  assertIsObject(result["productOwner"]);
  assertIsObject(result["productOwner"]["address"]);
  expect(result["productOwner"]["address"]["zip"]).toBe("04***");

  //test existence of pseudonymization
  expect(result["productOwner"]["address"]["addressPseudonym"]).toBeTruthy();
});

test("productpassport without schema and access_full.json", () => {
  const accessRights = AccessFileSchema.parse(access_full);
  const result = filter({
    obj: productpassport,
    accessRights: transformPolicyMachineAccessRights(accessRights, "readProperties"),
    digitsAccess: transformPolicyMachineDigitsAccess(accessRights, "readProperties"),
    pseudonymization: transformPolicyMachinePseudonymization(accessRights),
  }).obj;

  assertIsObject(result);

  // attributes of main productpassport object should all be null because without schema id field cannot be identified

  expect(result["productBatchId"]).toBe(null);
  expect(result["productId"]).toBe(null);
  expect(result["regioDataId"]).toBe(null);
  expect(result["productionDate"]).toBe(null);
  expect(result["bestBefore"]).toBe(null);
  expect(result["productName"]).toBe(null);
  expect(result["productShortName"]).toBe(null);
  expect(result["description"]).toBe(null);
  expect(result["category"]).toBe(null);
  expect(result["imageSrc"]).toBe(null);

  assertIsArray(result["ingredients"]);
  assertIsObject(result["ingredients"][0]);
  assertIsObject(result["ingredients"][1]);

  expect(result["ingredients"][0]["ingredientId"]).toBeNull();
  expect(result["ingredients"][0]["name"]).toBeNull();
  expect(result["ingredients"][0]["produced"]).toBeNull();
  expect(result["ingredients"][0]["processed"]).toBeNull();
  expect(result["ingredients"][0]["percentage"]).toBeNull();

  expect(result["ingredients"][1]["ingredientId"]).toBeNull();
  expect(result["ingredients"][1]["name"]).toBeNull();
  expect(result["ingredients"][1]["produced"]).toBeNull();
  expect(result["ingredients"][1]["processed"]).toBeNull();
  expect(result["ingredients"][1]["percentage"]).toBeNull();

  assertIsArray(result["certificates"]);
  assertIsObject(result["certificates"][0]);
  assertIsObject(result["certificates"][1]);

  // attributes of objects with "id" attribute should still have correct access rights applied
  expect(result["certificates"][0]["id"]).toBeNull();
  expect(result["certificates"][0]["name"]).toBe("Fair Trade");
  expect(result["certificates"][0]["link"]).toBe("https://www.fairtrade.net/");
  expect(result["certificates"][0]["imageSrc"]).toBe(
    "https://www.fairtrade.net/content/dam/fairtrade/fairtrade-germany/logos-und-siegel/Fairtrade%20Deutschland%20Logo_schwarz-grau.png",
  );
  expect(result["certificates"][0]["description"]).toBeNull();

  assertIsObject(result["productOwner"]);
  expect(result["productOwner"]["id"]).toBeNull();
  expect(result["productOwner"]["companyName"]).toBe("SonntagsSAFT GmbH");
  expect(result["productOwner"]["imageSrc"]).toBe(
    "https://www.sonntagssaft.de/images/Logo/SonntagsSaft_Logo-Claim_RGB.svg",
  );
});

test("path notation", () => {
  const result = filter({
    obj: { id: "1", address: { street: "some street", zip: "12345" } },
    accessRights: { "1": ["address.zip"] },
    digitsAccess: {},
    pseudonymization: {},
  }).obj;

  assertIsObject(result);
  assertIsObject(result["address"]);
  expect(result["address"]["zip"]).toBe("12345");
  expect(result["address"]["street"]).toBeNull();
});

test("path notation with *", () => {
  const result = filter({
    obj: { id: "1", address: { street: "some street", zip: "12345" } },
    accessRights: { "1": ["address.*"] },
    digitsAccess: {},
    pseudonymization: {},
  }).obj;

  assertIsObject(result);
  assertIsObject(result["address"]);
  expect(result["address"]["zip"]).toBe("12345");
  expect(result["address"]["street"]).toBe("some street");
});

test("path notation with **", () => {
  const result = filter({
    obj: { id: "1", user: { address: { street: "some street", zip: "12345" } } },
    accessRights: { "1": ["user.**"] },
    digitsAccess: {},
    pseudonymization: {},
  }).obj;

  assertIsObject(result);
  assertIsObject(result["user"]);
  assertIsObject(result["user"]["address"]);
  expect(result["user"]["address"]["zip"]).toBe("12345");
  expect(result["user"]["address"]["street"]).toBe("some street");
});

test("jsonpath", () => {
  const result = filter({
    obj: { id: "1", user: { address: { street: "some street", zip: "12345", country: "Germany" } } },
    accessRights: { "1": ["$.user.address[street,zip]"] },
    digitsAccess: {},
    pseudonymization: {},
  }).obj;

  assertIsObject(result);
  assertIsObject(result["user"]);
  assertIsObject(result["user"]["address"]);
  expect(result["user"]["address"]["zip"]).toBe("12345");
  expect(result["user"]["address"]["street"]).toBe("some street");
  expect(result["user"]["address"]["country"]).toBeNull();
});

test("jsonpath 2", () => {
  const result = filter({
    obj: {
      id: "1",
      user: {
        addresses: [
          { street: "some street", zip: "12345", country: "Germany" },
          { street: "some street 2", zip: "00000", country: "Germany" },
        ],
      },
    },
    accessRights: { "1": ["$.user.addresses[?(@.zip == '12345')][street,zip]"] },
    digitsAccess: {},
    pseudonymization: {},
  }).obj;

  assertIsObject(result);
  assertIsObject(result["user"]);
  assertIsArray(result["user"]["addresses"]);
  assertIsObject(result["user"]["addresses"][0]);
  assertIsObject(result["user"]["addresses"][1]);
  expect(result["user"]["addresses"][0]["zip"]).toBe("12345");
  expect(result["user"]["addresses"][0]["street"]).toBe("some street");
  expect(result["user"]["addresses"][0]["country"]).toBeNull();
  expect(result["user"]["addresses"][1]["zip"]).toBeNull();
  expect(result["user"]["addresses"][1]["street"]).toBeNull();
  expect(result["user"]["addresses"][1]["country"]).toBeNull();
});

test("invalid schema", () => {
  jest.spyOn(console, "warn").mockImplementation();

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  filter({
    obj: { id: "1", address: { street: "some street", zip: "12345" } },
    accessRights: { "1": ["address.zip"] },
    digitsAccess: {},
    pseudonymization: {},
    schema: { type: "string" },
  }).obj;

  expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("schema invalid"), expect.any(Array));
});

test("array with multipe schemas", () => {
  const result = filter({
    obj: [
      { first_id: "1", a: "a", b: "b" },
      { second_id: "2", a: "a", b: "b" },
    ],
    accessRights: { "1": ["a"], "2": ["b"] },
    digitsAccess: {},
    pseudonymization: {},
    schema: {
      type: "array",
      items: {
        oneOf: [
          { type: "object", objectClass: "first", uniqueIdentifier: "first_id", required: ["first_id"] },
          { type: "object", objectClass: "second", uniqueIdentifier: "second_id", required: ["second_id"] },
        ],
      },
    },
  }).obj;

  assertIsArray(result);
  assertIsObject(result[0]);
  assertIsObject(result[1]);

  expect(result[0]["a"]).toBe("a");
  expect(result[0]["b"]).toBeNull();
  expect(result[1]["a"]).toBeNull();
  expect(result[1]["b"]).toBe("b");
});

test("id of type object", () => {
  jest.spyOn(console, "warn").mockImplementation();

  const result = filter({
    obj: { id: { id: "1" }, address: { street: "some street", zip: "12345" } },
    accessRights: { "1": ["**"] },
    digitsAccess: {},
    pseudonymization: {},
  }).obj;

  assertIsObject(result);
  assertIsObject(result["address"]);
  expect(result["address"]["zip"]).toBeNull();
  expect(result["address"]["street"]).toBeNull();

  expect(console.warn).toHaveBeenCalledWith(
    expect.stringContaining("ID id:[object Object] must be a string or a number"),
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});
