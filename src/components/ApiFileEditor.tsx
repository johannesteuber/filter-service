import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { editorOptions } from "@/utils/editor-options";
import dynamic from "next/dynamic";
import { createDatentreuObject, updateDatentreuObject } from "@/app/actions/datentreu-object";
import { EditorProps } from "@monaco-editor/react";
import { useAppContext } from "@/app/contexts/AppContext";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
}) as React.ComponentType<EditorProps>;

export const ApiFileEditor = () => {
  const {
    accessRightsSource,
    accessTargets,
    apiFile,
    datentreuApplicationId,
    datentreuAccessToken,
    datentreuOwnerIdentityId,
    isLoading,
    theme,
    setAPIFile,
  } = useAppContext();
  return (
    <div className="space-y-6 mt-8">
      <div className="space-y-2 ">
        <div className="flex justify-between items-center">
          <p className="font-medium">API File</p>
          {isLoading.api && <p className="text-blue-500 text-sm">Loading...</p>}
        </div>
        <div className="h-128 border border-gray-300 rounded-md shadow-sm overflow-hidden dark:border-gray-600">
          <MonacoEditor
            height="100%"
            language="json"
            value={apiFile}
            onChange={(value) => setAPIFile(value || "")}
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

      <div>
        <p className="font-medium">Objects</p>
        <div className="grid grid-cols-4 gap-4">
          {accessTargets
            .filter((o) => o.id)
            .map((o, key) => {
              return (
                <Card key={key}>
                  <CardContent>
                    <p className="text-xs text-gray-500">{o.class}</p>
                    <p className="text-ellipsis overflow-hidden line-clamp-1 break-all">{o.id}</p>
                    <p className="text-xs">{o.properties.join(", ")}</p>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>

      {accessRightsSource === "datentreu" && (
        <Button
          onClick={async () => {
            for (const accessTarget of accessTargets) {
              if (!accessTarget.id || typeof accessTarget.id !== "string") continue;
              const res = await createDatentreuObject({
                applicationId: datentreuApplicationId,
                identityId: datentreuOwnerIdentityId,
                accessToken: datentreuAccessToken,
                objectId: accessTarget.id,
                objectEntityClass: accessTarget.class ?? accessTarget.id,
                properties: accessTarget.properties,
              });

              if (res.status === 400 && res.message?.endsWith("already exists")) {
                await updateDatentreuObject({
                  applicationId: datentreuApplicationId,
                  identityId: datentreuOwnerIdentityId,
                  accessToken: datentreuAccessToken,
                  objectId: accessTarget.id,
                  objectEntityClass: accessTarget.class ?? accessTarget.id,
                  properties: accessTarget.properties,
                });
              }
            }
          }}
        >
          Create / update all objects in Datentreu
        </Button>
      )}
    </div>
  );
};
