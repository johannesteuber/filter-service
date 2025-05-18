"use client";

import { filter } from "@/utils/filter";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { editor } from "monaco-editor";
import { Json } from "@/utils/types";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const HomeClient = () => {
  const [accessFileURL, setAccessFileURL] = useState<string>(
    "/api/files/access_full",
  );
  const [apiFileURL, setAPIFileURL] = useState<string>(
    "/api/files/productpassport",
  );
  const [accessFile, setAccessFile] = useState<string>("");
  const [apiFile, setAPIFile] = useState<string>("");
  const [output, setOutput] = useState<Json>({});
  const [error, setError] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "vs-dark">("light");
  const [isLoading, setIsLoading] = useState<{ access: boolean; api: boolean }>(
    {
      access: false,
      api: false,
    },
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [filterTime, setFilterTime] = useState<number | null>(null); // Use null initially

  // Detect theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(isDark ? "vs-dark" : "light");

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        setTheme(e.matches ? "vs-dark" : "light");
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  // Fetch access file only when accessFileURL changes
  useEffect(() => {
    const fetchAccessFile = async () => {
      setIsLoading((prev) => ({ ...prev, access: true }));
      try {
        const accessResponse = await fetch(`${accessFileURL}`);
        if (!accessResponse.ok) {
          throw new Error(
            `Failed to fetch access file: ${accessResponse.statusText}`,
          );
        }
        const accessData = await accessResponse.json();
        setAccessFile(JSON.stringify(accessData, null, 2));
        setError("");
      } catch (err) {
        console.error("Error fetching access file:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch access file",
        );
      } finally {
        setIsLoading((prev) => ({ ...prev, access: false }));
      }
    };

    fetchAccessFile();
  }, [accessFileURL]); // Only depends on accessFileURL

  // Fetch API file only when apiFileURL changes
  useEffect(() => {
    const fetchApiFile = async () => {
      setIsLoading((prev) => ({ ...prev, api: true }));
      try {
        const apiResponse = await fetch(`${apiFileURL}`);
        if (!apiResponse.ok) {
          throw new Error(
            `Failed to fetch API file: ${apiResponse.statusText}`,
          );
        }
        const apiData = await apiResponse.json();
        setAPIFile(JSON.stringify(apiData, null, 2));
        setError("");
      } catch (err) {
        console.error("Error fetching API file:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch API file",
        );
      } finally {
        setIsLoading((prev) => ({ ...prev, api: false }));
      }
    };

    fetchApiFile();
  }, [apiFileURL]); // Only depends on apiFileURL

  // Process and filter the data when the files change
  useEffect(() => {
    try {
      if (!accessFile.trim() || !apiFile.trim()) {
        setOutput({});
        setError("");
        setLogs([]); // Clear logs when files are empty
        setFilterTime(null); // Clear filter time
        return;
      }

      const accessJSON = JSON.parse(accessFile);
      const apiJSON = JSON.parse(apiFile);
      console.log(accessJSON, apiJSON);

      const output = JSON.parse(JSON.stringify(apiJSON));
      const startTime = performance.now();
      const { logs } = filter([], accessJSON, apiJSON, output, "");
      const endTime = performance.now();
      setFilterTime(endTime - startTime); // Store the duration
      setLogs(logs);
      setOutput(output);
      setError("");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Invalid JSON input");
      setLogs([]); // Clear logs on error
      setFilterTime(null); // Clear filter time on error
    }
  }, [accessFile, apiFile]);

  const editorOptions: editor.IEditorOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    formatOnPaste: true,
    wordWrap: "on",
    padding: { top: 8 },
    readOnly: false, // Make editable by default
  };

  // Options for read-only output editor
  const outputEditorOptions: editor.IEditorOptions = {
    ...editorOptions,
    readOnly: true,
  };

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Filter Service Prototype v1 (18.05.2023)
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 space-y-2">
          <label htmlFor="accessFileURL" className="font-medium">
            Access File URL
          </label>
          <div className="flex">
            <input
              id="accessFileURL"
              type="text"
              value={accessFileURL}
              onChange={(e) => setAccessFileURL(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="/api/files/access_full"
            />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <label htmlFor="apiFileURL" className="font-medium">
            API File URL
          </label>
          <div className="flex">
            <input
              id="apiFileURL"
              type="text"
              value={apiFileURL}
              onChange={(e) => setAPIFileURL(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="/api/files/productpassport"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="font-medium">Access File</p>
            {isLoading.access && (
              <p className="text-blue-500 text-sm">Loading...</p>
            )}
          </div>
          <div className="h-64 border border-gray-300 rounded-md shadow-sm overflow-hidden dark:border-gray-600">
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

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="font-medium">API File</p>
            {isLoading.api && (
              <p className="text-blue-500 text-sm">Loading...</p>
            )}
          </div>
          <div className="h-64 border border-gray-300 rounded-md shadow-sm overflow-hidden dark:border-gray-600">
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
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-4">
            <p className="font-medium">Output</p>
            {filterTime !== null && ( // Only display if filterTime is not null
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Filter time: {filterTime.toFixed(2)} ms{" "}
              </p>
            )}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <div className="h-96 border border-gray-300 rounded-md shadow-sm overflow-hidden dark:border-gray-600">
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

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold">Logs</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No logs to display.
          </p>
        ) : (
          <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto dark:border-gray-600 dark:bg-gray-700">
            <ul className="list-disc list-inside space-y-1">
              {logs.map((log, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 dark:text-gray-300 break-words"
                >
                  {log}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeClient;
