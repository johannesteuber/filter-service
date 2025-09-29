import { Button } from "@/components/ui/button";
import { createDatentreuAccessRules, updateDatentreuAccessRules } from "../app/actions/datentreu-access";
import { AccessFile } from "@/types/types";
import dynamic from "next/dynamic";
import { AccessFileSchema } from "@/schemas/access-rule-schema";
import { editorOptions } from "@/utils/editor-options";
import { EditorProps } from "@monaco-editor/react";
import { useAppContext } from "@/app/contexts/AppContext";
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
}) as React.ComponentType<EditorProps>;

export const AccessFileEditor = () => {
  const {
    accessTargets,
    datentreuAccessToken,
    datentreuApplicationId,
    accessFileType,
    datentreuIdentityId,
    datentreuRequestedById,
    accessFile,
    isLoading,
    theme,
    setAccessFile,
  } = useAppContext();

  return (
    <div className="space-y-6 mt-8">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="font-medium">Access File</p>
          {isLoading.access && <p className="text-blue-500 text-sm">Loading...</p>}
        </div>
        <div className="h-128 border border-gray-300 rounded-md shadow-sm overflow-hidden dark:border-gray-600">
          <MonacoEditor
            height="100%"
            language="json"
            value={accessFile}
            onChange={(value) => setAccessFile(value || "")}
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
            setAccessFile(
              JSON.stringify(
                accessTargets
                  .filter((o) => o.id)
                  .map((o) => {
                    return {
                      objectId: o.id,
                      objectEntityClass: "",
                      identityId: accessFileType === "datentreu" ? datentreuIdentityId : "",
                      objectProperties: {
                        readProperties: [],
                        writeProperties: [],
                        shareReadProperties: [],
                        shareWriteProperties: [],
                      },
                    };
                  }) as AccessFile,
              ),
            );
          }}
        >
          Replace by empty rules for all objects
        </Button>
        {accessFileType === "datentreu" && (
          <Button
            onClick={async () => {
              const accessJSON = JSON.parse(accessFile) as AccessFile;
              try {
                const parsedAccessJson = AccessFileSchema.parse(accessJSON);
                for (const rule of parsedAccessJson) {
                  const res = await createDatentreuAccessRules({
                    applicationId: datentreuApplicationId,
                    identityId: datentreuIdentityId,
                    accessToken: datentreuAccessToken,
                    requestedById: datentreuRequestedById,
                    objectId: rule.objectId,
                    accessRule: rule,
                  });

                  if (res.status === 400 && res.message?.includes("already exists")) {
                    await updateDatentreuAccessRules({
                      applicationId: datentreuApplicationId,
                      identityId: datentreuIdentityId,
                      accessToken: datentreuAccessToken,
                      requestedById: datentreuRequestedById,
                      objectId: rule.objectId,
                      accessRule: rule,
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
