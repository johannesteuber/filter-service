import { Button } from "@/components/ui/button";
import { createDatentreuAccessRules, updateDatentreuAccessRules } from "../app/actions/datentreu-access";
import dynamic from "next/dynamic";
import { editorOptions } from "@/utils/editor-options";
import { EditorProps } from "@monaco-editor/react";
import { useAppContext } from "@/app/contexts/AppContext";
import { AccessRight } from "@/types/types";
import { parseFile } from "@/app/page.client";
import { AccessRightsSchema } from "@/schemas/access-rule-schema";
import { transformToPolicyMachine } from "@/policy-machine/transform-policy-machine-results";
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
}) as React.ComponentType<EditorProps>;

export const AccessRightsEditor = () => {
  const {
    accessTargets,
    datentreuAccessToken,
    datentreuApplicationId,
    datentreuOwnerIdentityId,
    datentreuOtherIdentityId,
    isLoading,
    theme,
    accessRightsSource,
    accessRights,
    setAccessRights,
  } = useAppContext();

  return (
    <div className="space-y-6 mt-8">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="font-medium">Access Rights</p>
          {isLoading.access && <p className="text-blue-500 text-sm">Loading...</p>}
        </div>

        <div className="h-128  border border-gray-300 rounded-md shadow-sm overflow-hidden dark:border-gray-600">
          <MonacoEditor
            height="100%"
            language="json"
            value={accessRights}
            onChange={(value) => setAccessRights(value || "")}
            theme={theme}
            options={editorOptions}
            loading={
              <div className="flex items-center justify-center h-full dark:bg-gray-800 dark:text-gray-400">
                Loading editor...
              </div>
            }
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => {
            setAccessRights(
              JSON.stringify(
                accessTargets
                  .filter((o) => o.objectId)
                  .map((o) => {
                    return {
                      objectId: o.objectId,
                      propertyAccess: [],
                      digitsAccess: {},
                      pseudonymization: {},
                    } as AccessRight;
                  }),
              ),
            );
          }}
        >
          Replace by empty rules for all objects
        </Button>
        {accessRightsSource === "datentreu" && (
          <Button
            onClick={async () => {
              try {
                const accessRightsParsed = parseFile(accessRights, "property access rights", AccessRightsSchema);
                if (!accessRightsParsed) return;
                for (const accessRight of accessRightsParsed) {
                  if (!accessRight.objectId || typeof accessRight.objectId !== "string") continue;
                  const res = await createDatentreuAccessRules({
                    applicationId: datentreuApplicationId,
                    identityId: datentreuOtherIdentityId,
                    accessToken: datentreuAccessToken,
                    requestedById: datentreuOwnerIdentityId,
                    objectId: accessRight.objectId,
                    accessRules: transformToPolicyMachine(accessRight),
                  });

                  if (res.status === 400 && res.message?.includes("already exists")) {
                    await updateDatentreuAccessRules({
                      applicationId: datentreuApplicationId,
                      identityId: datentreuOtherIdentityId,
                      accessToken: datentreuAccessToken,
                      requestedById: datentreuOwnerIdentityId,
                      objectId: accessRight.objectId,
                      accessRules: transformToPolicyMachine(accessRight),
                    });
                  }
                }
              } catch (e) {
                console.error(e);
                alert("Invalid access file");
              }
            }}
          >
            Push all to Datentreu
          </Button>
        )}
      </div>
    </div>
  );
};
