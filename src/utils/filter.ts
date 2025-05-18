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



export const filter = (accessFull: AccessFile, obj: any, parentPath: string, objRef: any, index?: number) => {
    for (const [key, value] of Object.entries(obj)) {
        const path = [`${parentPath}${index || index === 0 ? `[${index}]` : ""}`, key].filter(Boolean).join(".")

        if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                filter(accessFull, value[i], path, objRef[key][i], i)
            }
        } else if (typeof value === 'object' && value !== null) {
            filter(accessFull ,value, path, objRef[key])
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
            if (!readAccess) {
                objRef[key] = null
                console.log(`remove ${path} due to missing read access`)
            }
        }
    }
}