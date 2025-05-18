type AccessRule = {
    "objectId": string,
    "objectEntityClass": string,
    "identityId": string,
    "path"?: string,
    "identityProperties": {
        "readProperties": string[],
        "writeProperties": string[],
        "shareReadProperties": string[],
        "shareWriteProperties": string[]
    }
}

export type AccessFile = {
    access_rules: AccessRule[]
}

// Define a recursive type that can represent any nested object structure
type JsonValue = string | number | boolean | null | undefined | JsonObject | JsonArray;
export type JsonObject = string | number | boolean | null | undefined  | JsonArray |{ [key: string]: JsonValue };
type JsonArray = JsonValue[];

// Adding optional properties that we know might exist
export type FilterableObject = JsonObject & {
    id?: string;
    ingredientId?: string;
}

export const filter = (logs: string[], accessFull:AccessFile, obj: FilterableObject, parentPath: string, objRef: JsonObject, index?: number) => {
    for (const [key, value] of Object.entries(obj)) {
        const path = [`${parentPath}${index || index === 0 ? `[${index}]` : ""}`, key].filter(Boolean).join(".")

        if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                if(typeof objRef === "object"){
                    if(!Array.isArray(objRef)){
                        if(Array.isArray(objRef?.[key])){
                            filter(logs, accessFull, value[i], path, objRef[key][i], i)
                        }
                    }
                }
            }
        } else if (typeof value === 'object' && value !== null) {
            if(typeof objRef === "object"){
                if(!Array.isArray(objRef)){
                    filter(logs, accessFull, value, path, objRef?.[key])

                }

            }
        } else {
            const rule = accessFull.access_rules.find(rule => {
                if (parentPath) {
                    const correctPath = rule.path === parentPath
                    if (index || index === 0) {
                        //parent is array
                        const ids = [obj.id, obj.ingredientId]
                        return correctPath && ids.includes(rule.objectId)
                    }
                    return correctPath
                }
                return rule.path === undefined
            })

            const readAccess = rule?.identityProperties.readProperties.includes(key)
            if (!readAccess && key !== "id" && key !== "ingredientId") {
                if(objRef){
                    if(typeof objRef === "object"){
                        if(!Array.isArray(objRef)){
                            objRef[key] = null
                            console.log(`remove ${path} due to missing read access`)
                            logs.push(`remove ${path} due to missing read access`)
                        }
                    }
                }

            }
        }
    }
    return {logs}
}
