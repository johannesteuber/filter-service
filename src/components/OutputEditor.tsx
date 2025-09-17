import dynamic from "next/dynamic";
import type { editor } from "monaco-editor";
import { editorOptions } from "@/utils/editor-options";
import { Json } from "@/types/types";
import { EditorProps } from "@monaco-editor/react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
}) as React.ComponentType<EditorProps>;

type OutputEditorProps = {
  theme: string;
  filterTime: number | null;
  error: string;
  output: Json;
};

// Options for read-only output editor
const outputEditorOptions: editor.IEditorOptions = {
  ...editorOptions,
  readOnly: true,
};

export const OutputEditor = ({ theme, filterTime, error, output }: OutputEditorProps) => {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-4">
          <p className="font-medium">Output</p>
          {filterTime !== null && ( // Only display if filterTime is not null
            <p className="text-sm text-gray-600 dark:text-gray-400">Filter time: {filterTime.toFixed(2)} ms </p>
          )}
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      <div className="h-128 border border-gray-300 rounded-md shadow-sm overflow-hidden dark:border-gray-600">
        <MonacoEditor
          height="100%"
          language="json"
          value={JSON.stringify(output, null, 2)}
          theme={theme}
          options={outputEditorOptions}
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
