import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { editorOptions } from "@/utils/editor-options";
import dynamic from "next/dynamic";
import { AccessFileType } from "../app/page.client";
import { createDatentreuObject, updateDatentreuObject } from "@/app/actions/datentreu-object";
import { EditorProps } from "@monaco-editor/react";
import { AccessTargetWithAttributes } from "@/filter/analyze-api-result";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
}) as React.ComponentType<EditorProps>;

type ApiFileEditorProps = {
  apiFile: string;
  setAPIFile: (value: string) => void;
  isLoading: {
    api: boolean;
  };
  theme: string;
  accessTargetsWithAttributes: AccessTargetWithAttributes[];
  accessFileType: AccessFileType;
  applicationId: string;
  requestedById: string;
  accessToken: string;
};

export const ApiFileEditor = ({
  apiFile,
  setAPIFile,
  isLoading,
  theme,
  accessTargetsWithAttributes,
  accessFileType,
  applicationId,
  requestedById,
  accessToken,
}: ApiFileEditorProps) => {
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
          {accessTargetsWithAttributes
            .filter((o) => o.id)
            .map((o, key) => {
              return (
                <Card key={key}>
                  <CardContent>
                    <p className="text-xs text-gray-500">{o.class}</p>
                    <p className="text-ellipsis overflow-hidden line-clamp-1 break-all">{o.id}</p>
                    <p className="text-xs">{o.attributes.join(", ")}</p>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>

      {accessFileType === "datentreu" && (
        <Button
          onClick={async () => {
            for (const accessTarget of accessTargetsWithAttributes) {
              if (!accessTarget.id) continue;
              const res = await createDatentreuObject({
                applicationId,
                identityId: requestedById,
                accessToken,
                objectId: accessTarget.id,
                objectEntityClass: accessTarget.class ?? accessTarget.id,
                properties: accessTarget.attributes,
              });

              if (res.status === 400 && res.message?.endsWith("already exists")) {
                await updateDatentreuObject({
                  applicationId,
                  identityId: requestedById,
                  accessToken,
                  objectId: accessTarget.id,
                  objectEntityClass: accessTarget.class ?? accessTarget.id,
                  properties: accessTarget.attributes,
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
