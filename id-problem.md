# Work around missing ids in API result:


-> How to retrieve the access rules for objects in the API result if they don't have an "id" field to hit the `{baseUrl}/access/?identityId={forId}&requestedById={byId}` endpoint



## 1. replace the object with null

## 2. look for fallback ids (property names that contain "id")
only works if there is **exactly one** property which contains "id"

BUT: still it could be an foreign key and not the id of the object itself

-> that makes this approach **unusable**!

## 3. create a structure for each API endpoint

### 3.1. if every object has an id (just sometimes named differently e.g. "ingredientId")

```javascript
{
  type: "object",
  id: "productBatchId",
  properties: {
    certificates: {
      type: "array",
      id: "id",
    },
    productOwner: {
      type: "object",
      id: "id",
      properties: {
        address: {
          type: "object",
          id: "id"
        }
      }
    },
    ingredients: {
      type: "array",
      id: "ingredientId",
    },
    productBatchSteps: {
      type: "array",
      id: "id",
      properties: {
        address: {
          type: "object",
          id: "id"
        },
        stepEntries: {
          type: "array",
          id: "id",
        }
      }
    }
  }
}
```

-> allows to find the correct id for each object inside the api result

### 3.2. if there are missing ids in some objects

```javascript
{
    type: "object",
    id: "productBatchId",
    properties: {
      certificates: {
        type: "array",
        id: null, // <--
        objectEntityClass: "certificate",
      },
      productOwner: {
        type: "object",
        id: "id",
        properties: {
          address: {
            type: "object",
            id: "id"
          }
        }
      },
      ingredients: {
        type: "array",
        id: "ingredientId",
      },
      productBatchSteps: {
        type: "array",
        id: "id",
        properties: {
          address: {
            type: "object",
            id: "id"
          },
          stepEntries: {
            type: "array",
            id: "id",
          }
        }
      }
    }
  }
  ```

  -> the specific instance of the object returned inside the api result cannot be identified anymore reliably
  
  -> access control can only happen based on the objectEntityClass
    -> rules like this are needed and can be applied accordingly:
  ```json
  {
    "objectId": null,
    "objectEntityClass": "ProductPassport",
    "identityId": "f7e1f51c-1dd6-40d1-8269-4055b99f6b2b",
    "identityProperties": {
      "readProperties": [
        "productName",
        "productShortName",
        "description",
        "category",
        "imageSrc",
        "productionDate",
        "bestBefore",
        "certificates",
        "productOwner",
        "ingredients",
        "productBatchSteps"
      ],
      "writeProperties": [],
      "shareReadProperties": [],
      "shareWriteProperties": []
    }
  },
  ```

## 4. create hashes for objects without ids

say you want to give fine grained access to exactly those two objects which are somehow nested inside an api result

for the first element ("Apfel") only the "name" property is allowed
for the second element ("Birne") the "name" and "produced" properties are allowed

as you can see, both objects are lacking an "id" field

```json
"ingredients": [
        {
            "name": "Apfel",
            "produced": "2025-03-09T09:47:02.96",
            "processed": "2025-03-09T09:47:02.96",
            "percentage": 70
        },
        {
            "name": "Birne",
            "produced": "2025-03-09T09:47:02.96",
            "processed": "2025-03-09T09:47:02.96",
            "percentage": 30
        }
    ],
```

Now a hash of the objects could be created

`2eca527590ad8fb37a06f59f6d072bec32c1aae9d1cade26077d9f96b7e4877f` (Apfel)

`afc3b12a148b049869b4ebf5b18d590996d510f89f8630b34ce4dd3c0cf8df65` (Birne)

and used as identifier for the access rules like

```json
{
  "objectId": "2eca527590ad8fb37a06f59f6d072bec32c1aae9d1cade26077d9f96b7e4877f",
  "objectEntityClass": "Ingredient",
  "identityId": "f7e1f51c-1dd6-40d1-8269-4055b99f6b2b",
  "identityProperties": {
    "readProperties": [
      "name",
    ],
    "writeProperties": [],
    "shareReadProperties": [],
    "shareWriteProperties": []
  }
},
```

and


```json
{
  "objectId": "afc3b12a148b049869b4ebf5b18d590996d510f89f8630b34ce4dd3c0cf8df65",
  "objectEntityClass": "Ingredient",
  "identityId": "f7e1f51c-1dd6-40d1-8269-4055b99f6b2b",
  "identityProperties": {
    "readProperties": [
      "name",
      "produced",
    ],
    "writeProperties": [],
    "shareReadProperties": [],
    "shareWriteProperties": []
  }
},
```

**Obvious gotcha**: as soon as an object is somehow changed the access rules do not apply anymore because the hash changes

## 5. Integration of ABAC
to define access rules based on properties of the object
e.g. if name == "Apfel": only the "name" property is allowed
or if name == "Brine": the "name" and "produced" properties are allowed

an access rules for the first case could like like this
```json
{
  "objectId": null,
  "objectEntityClass": "Ingredient",
  "identityId": "f7e1f51c-1dd6-40d1-8269-4055b99f6b2b",
  "objectProperties": [
      {"key": "name", "comparison": "equals", "value": "Apfel"},
  ],
  "identityProperties": {
    "readProperties": [
      "name",
    ],
    "writeProperties": [],
    "shareReadProperties": [],
    "shareWriteProperties": []
  }
},
```

It remains to be discussed what happens if multile access rules match
one could argue that the intersection or union of the readProperties of both matched rules is allowed


## combining the approaches

if no id is present:
1. lookup in api endpoint structure if id has a different name (3.1.), otherwise:
2. lookup ABAC rules (5.), otherwise:
3. lookup hash (4.), otherwise:
4. lookup access rules for objectEntityClass (3.2.), otherwise:
5. return null (1.)




