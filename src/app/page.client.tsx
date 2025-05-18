"use client"

import { filter } from "@/utils/filter";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
    () => import("@monaco-editor/react"),
    { ssr: false }
);

const HomeClient = () => {
    const [accessFile, setAccessFile] = useState<string>("");
    const [apiFile, setAPIFile] = useState<string>("");
    const [output, setOutput] = useState<any>({});
    const [error, setError] = useState<string>("");
    const [theme, setTheme] = useState("light");

    // Detect theme
    useEffect(() => {
        if (typeof window !== "undefined") {
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setTheme(isDark ? "vs-dark" : "light");

            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = (e) => {
                setTheme(e.matches ? "vs-dark" : "light");
            };

            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, []);

    useEffect(() => {
        try {
            if (!accessFile.trim() || !apiFile.trim()) {
                setOutput({});
                setError("");
                return;
            }

            const accessJSON = JSON.parse(accessFile);
            const apiJSON = JSON.parse(apiFile);
            const output = JSON.parse(JSON.stringify(apiJSON));
            filter(accessJSON, apiJSON, "", output);
            setOutput(output);
            setError("");
        } catch (e) {
            console.error(e);
            setError(e.message || "Invalid JSON input");
        }
    }, [accessFile, apiFile]);

    const editorOptions = {
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        formatOnPaste: true,
        wordWrap: "on",
    };

    return (
        <div className="max-w-6xl mx-auto p-6 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Filter Service</h1>

            <div className="space-y-6">
                <div className="space-y-2">
                    <p className="font-medium">Access File</p>
                    <div className="h-[75vh] border border-gray-300 rounded-md shadow-sm overflow-hidden">
                        <MonacoEditor
                            height="100%"
                            language="json"
                            value={accessFile}
                            onChange={(value) => setAccessFile(value || "")}
                            theme={theme}
                            options={{
                                ...editorOptions,
                                padding: { top: 8 },
                            }}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="font-medium">API File</p>
                    <div className="h-[75vh] border border-gray-300 rounded-md shadow-sm overflow-hidden">
                        <MonacoEditor
                            height="100%"
                            language="json"
                            value={apiFile}
                            onChange={(value) => setAPIFile(value || "")}
                            theme={theme}
                            options={{
                                ...editorOptions,
                                padding: { top: 8 },
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <div className="flex justify-between items-center mb-2">
                    <p className="font-medium">Output</p>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <div className="h-[75vh] border border-gray-300 rounded-md shadow-sm overflow-hidden">
                    <MonacoEditor
                        height="100%"
                        language="json"
                        value={JSON.stringify(output, null, 2)}
                        theme={theme}
                        options={{
                            ...editorOptions,
                            readOnly: true,
                            padding: { top: 8 },
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default HomeClient;
