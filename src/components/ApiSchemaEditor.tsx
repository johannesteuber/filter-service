import { useAppContext } from "@/app/contexts/AppContext";
import { editorOptions } from "@/utils/editor-options";
import { EditorProps } from "@monaco-editor/react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
}) as React.ComponentType<EditorProps>;

export const ApiSchemaEditor = () => {
  const { apiSchemaFile, isLoading, theme, setAPISchemaFile } = useAppContext();
  return (
    <div className="space-y-2 mt-8">
      <div className="flex justify-between items-center">
        <p className="font-medium">API Schema File</p>
        {isLoading.api && <p className="text-blue-500 text-sm">Loading...</p>}
      </div>
      <div className="h-128 border border-gray-300 rounded-md shadow-sm overflow-hidden dark:border-gray-600">
        <MonacoEditor
          height="100%"
          language="json"
          value={apiSchemaFile}
          onChange={(value) => setAPISchemaFile(value || "")}
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
  );
};
