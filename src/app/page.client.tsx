"use client";

import { filter } from "@/filter/filter";
import { useEffect, useState } from "react";
import { AccessFile, ApiSchemaFile, Json } from "@/types/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AccessTargetWithAttributes, analyzeApiResult } from "@/filter/analyze-api-result";
import { fetchDatentreuObjectAccessRule } from "./actions/datentreu-access";
import { useTheme } from "@/utils/editor-options";
import { AccessRightsSelection } from "../components/AccessRightsSelection";
import { OutputEditor } from "../components/OutputEditor";
import { ApiFileEditor } from "../components/ApiFileEditor";
import { ApiSchemaEditor } from "../components/ApiSchemaEditor";
import { AccessFileEditor } from "../components/AccessFileEditor";
import { AccessFileSchema, AccessRuleSchema } from "../schemas/access-rule-schema";
import { ApiSchemaFileSchema } from "../schemas/api-file-schema-schema";
import {
  transformPolicyMachineAccessRights,
  transformPolicyMachineDigitsAccess,
  transformPolicyMachinePseudonymization,
} from "../policy-machine/transform-policy-machine-results";

export type AccessFileType = "manual" | "datentreu";

const HomeClient = () => {
  const [accessTargets, setAccessTargets] = useState<AccessTargetWithAttributes[]>([]);

  const [datentreuUsername, setDatentreuUsername] = useState<string>("");
  const [datentreuPassword, setDatentreuPassword] = useState<string>("");
  const [datentreuAccessToken, setDatentreuAccessToken] = useState<string>("");
  const [datentreuApplicationId, setDatentreuApplicationId] = useState<string>("");

  const [accessFileType, setAccessFileType] = useState<AccessFileType>("manual");
  const [datentreuIdentityId, setDatentreuIdentityId] = useState<string>("");
  const [datentreuRequestedById, setDatentreuRequestedById] = useState<string>("");

  const [apiFileURL, setAPIFileURL] = useState<string>("/api/files/productpassport");
  const [apiSchemaFileURL, setAPISchemaFileURL] = useState<string>("/api/files/productpassport.schema");
  const [accessFileURL, setAccessFileURL] = useState<string>("/api/files/access_full");
  const [accessFile, setAccessFile] = useState<string>("");
  const [apiFile, setAPIFile] = useState<string>("");
  const [apiSchemaFile, setAPISchemaFile] = useState<string>("");
  const [output, setOutput] = useState<Json>({});
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<{
    access: boolean;
    api: boolean;
  }>({
    access: false,
    api: false,
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [filterTime, setFilterTime] = useState<number | null>(null); // Use null initially
  const { theme } = useTheme();

  //fetch from local storage
  useEffect(() => {
    setDatentreuAccessToken(localStorage.getItem("datentreuAccessToken") ?? "");
    setDatentreuApplicationId(localStorage.getItem("datentreuApplicationId") ?? "");
    setDatentreuIdentityId(localStorage.getItem("datentreuIdentityId") ?? "");
    setDatentreuRequestedById(localStorage.getItem("datentreuRequestedById") ?? "");
  }, []);

  // Fetch access file only when accessFileURL changes
  useEffect(() => {
    const fetchAccessFile = async () => {
      setIsLoading((prev) => ({
        ...prev,
        access: true,
      }));

      if (accessFileType === "manual") {
        try {
          const accessResponse = await fetch(`${accessFileURL}`);
          if (!accessResponse.ok) {
            console.warn(`Failed to fetch access file: ${accessResponse.statusText}`);
            return;
          }
          const accessData = await accessResponse.json();
          setAccessFile(JSON.stringify(accessData, null, 2));
          setError("");
        } catch (err) {
          console.error("Error fetching access file:", err);
          setError(err instanceof Error ? err.message : "Failed to fetch access file");
        } finally {
          setIsLoading((prev) => ({
            ...prev,
            access: false,
          }));
        }
        return;
      }

      if (accessFileType === "datentreu") {
        if (!datentreuAccessToken || !datentreuApplicationId || !datentreuIdentityId) {
          return;
        }

        const accessRights: AccessFile = [];

        for (const accessTarget of accessTargets) {
          if (!accessTarget.id) continue;
          try {
            const res = await fetchDatentreuObjectAccessRule({
              accessToken: datentreuAccessToken,
              applicationId: datentreuApplicationId,
              identityId: datentreuIdentityId,
              objectId: accessTarget.id,
            });
            const rule = AccessRuleSchema.parse(res);
            accessRights.push(rule);
            console.log(res);
          } catch (e) {
            console.log(">>>", "not found", e);
          }
        }
        setAccessFile(JSON.stringify(accessRights, null, 2));

        /*
        const rules = await fetchDatentreuObjectAccessRules({
          accessToken: datentreuAccessToken,
          applicationId: datentreuApplicationId,
          identityId: datentreuIdentityId,
          objectIds: objectIdentifiers.filter((o) => o.type === "id").map((o) => o.id),
        });
        */
      }
    };

    fetchAccessFile();
  }, [accessFileURL, accessFileType, datentreuApplicationId, datentreuIdentityId]); // Only depends on accessFileURL

  // Fetch API file only when apiFileURL changes
  useEffect(() => {
    const fetchApiFile = async () => {
      setIsLoading((prev) => ({
        ...prev,
        api: true,
      }));
      try {
        const apiResponse = await fetch(`${apiFileURL}`);
        if (!apiResponse.ok) {
          throw new Error(`Failed to fetch API file: ${apiResponse.statusText}`);
        }
        const apiData = await apiResponse.json();
        setAPIFile(JSON.stringify(apiData, null, 2));
        setError("");
      } catch (err) {
        console.error("Error fetching API file:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch API file");
      } finally {
        setIsLoading((prev) => ({
          ...prev,
          api: false,
        }));
      }
    };

    fetchApiFile();
  }, [apiFileURL]); // Only depends on apiFileURL

  // Fetch API file only when apiFileURL changes
  useEffect(() => {
    const fetchApiSchemaFile = async () => {
      setIsLoading((prev) => ({
        ...prev,
        api: true,
      }));
      try {
        const apiResponse = await fetch(`${apiSchemaFileURL}`);
        if (!apiResponse.ok) {
          throw new Error(`Failed to fetch API schema file: ${apiResponse.statusText}`);
        }
        const apiData = await apiResponse.json();
        setAPISchemaFile(JSON.stringify(apiData, null, 2));
        setError("");
      } catch (err) {
        console.error("Error fetching API schema file:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch API schema file");
      } finally {
        setIsLoading((prev) => ({
          ...prev,
          api: false,
        }));
      }
    };

    fetchApiSchemaFile();
  }, [apiSchemaFileURL]); // Only depends on apiFileURL

  const displayError = (error: string, e?: unknown) => {
    setOutput({});
    setError(error);
    setLogs([]); // Clear logs on error
    setFilterTime(null); // Clear filter time on error
    if (e) console.error(e);
  };

  // Process and filter the data when the files change
  useEffect(() => {
    if (!accessFile.trim() || !apiFile.trim()) {
      displayError("");
      return;
    }

    let parsedAccessJson: AccessFile;
    let apiJSON: Json;
    let parsedSchemaJson: ApiSchemaFile;
    try {
      const accessJSON = JSON.parse(accessFile) as AccessFile;
      parsedAccessJson = AccessFileSchema.parse(accessJSON);
    } catch (e) {
      displayError("invalid api file", e);
      return;
    }

    try {
      apiJSON = JSON.parse(apiFile);
    } catch (e) {
      displayError("invalid api file", e);
      return;
    }

    try {
      const schemaJSON = apiSchemaFile.trim() ? JSON.parse(apiSchemaFile) : undefined;
      parsedSchemaJson = ApiSchemaFileSchema.parse(schemaJSON);
    } catch (e) {
      displayError("invalid schema file", e);
      return;
    }

    try {
      const startTime = performance.now();
      const accessTargets = analyzeApiResult(apiJSON, parsedSchemaJson);
      setAccessTargets(accessTargets);

      // TODO: fetch access rules with the ids
      const TYPE = "readProperties";

      const { obj: output, logs } = filter({
        accessRights: transformPolicyMachineAccessRights(parsedAccessJson, TYPE),
        digitsAccess: transformPolicyMachineDigitsAccess(parsedAccessJson, TYPE),
        pseudonymization: transformPolicyMachinePseudonymization(parsedAccessJson),
        obj: apiJSON,
        schema: parsedSchemaJson,
      });
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
  }, [accessFile, apiFile, apiSchemaFile]);

  useEffect(() => {
    localStorage.setItem("datentreuApplicationId", datentreuApplicationId);
  }, [datentreuApplicationId]);

  useEffect(() => {
    localStorage.setItem("datentreuIdentityId", datentreuIdentityId);
  }, [datentreuIdentityId]);

  useEffect(() => {
    localStorage.setItem("datentreuRequestedById", datentreuRequestedById);
  }, [datentreuRequestedById]);

  useEffect(() => {
    localStorage.setItem("datentreuAccessToken", datentreuAccessToken);
  }, [datentreuAccessToken]);

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Filter Service</h1>

      <div className="flex flex-col gap-4">
        <AccessRightsSelection
          accessFileUrl={accessFileURL}
          setAccessFileUrl={setAccessFileURL}
          setDatentreuUsername={setDatentreuUsername}
          setDatentreuPassword={setDatentreuPassword}
          setDatentreuAccessToken={setDatentreuAccessToken}
          datentreuAccessToken={datentreuAccessToken}
          datentreuUsername={datentreuUsername}
          datentreuPassword={datentreuPassword}
          datentreuRequestedById={datentreuRequestedById}
          setDatentreuRequestedById={setDatentreuRequestedById}
          datentreuIdentityId={datentreuIdentityId}
          setDatentreuIdentityId={setDatentreuIdentityId}
          datentreuApplicationId={datentreuApplicationId}
          setDatentreuApplicationId={setDatentreuApplicationId}
          accessFileType={accessFileType}
          setAccessFileType={setAccessFileType}
        />

        <Card>
          <CardContent>
            <div className="flex gap-4">
              <div className="space-y-2 w-full">
                <Label htmlFor="apiFileURL">API File URL</Label>

                <Input
                  id="apiFileURL"
                  type="text"
                  value={apiFileURL}
                  onChange={(e) => setAPIFileURL(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="/api/files/productpassport"
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="apiFileURL">API Schema File URL</Label>
                <Input
                  id="apiSchemaURL"
                  type="text"
                  value={apiSchemaFileURL}
                  onChange={(e) => setAPISchemaFileURL(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="/api/files/productpassport.schema"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ApiFileEditor
        apiFile={apiFile}
        setAPIFile={setAPIFile}
        isLoading={isLoading}
        theme={theme}
        accessTargetsWithAttributes={accessTargets}
        accessFileType={accessFileType}
        applicationId={datentreuApplicationId}
        requestedById={datentreuRequestedById}
        accessToken={datentreuAccessToken}
      />
      <ApiSchemaEditor
        apiSchemaFile={apiSchemaFile}
        setAPISchemaFile={setAPISchemaFile}
        isLoading={isLoading}
        theme={theme}
      />
      <AccessFileEditor
        accessFile={accessFile}
        setAccessFile={setAccessFile}
        accessFileType={accessFileType}
        datentreuAccessToken={datentreuAccessToken}
        datentreuApplicationId={datentreuApplicationId}
        datentreuIdentityId={datentreuIdentityId}
        datentreuRequestedById={datentreuRequestedById}
        isLoading={isLoading}
        theme={theme}
        accessTargets={accessTargets}
      />
      <OutputEditor error={error} filterTime={filterTime} output={output} theme={theme} />

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold">Logs</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No logs to display.</p>
        ) : (
          <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto dark:border-gray-600 dark:bg-gray-700">
            <ul className="list-disc list-inside space-y-1">
              {logs.map((log, index) => (
                <li
                  key={index}
                  className={`text-sm dark:text-gray-300 break-words ${log.startsWith("access granted") ? "text-blue-500" : log.startsWith("access denied") ? "text-red-500" : ""}`}
                  dangerouslySetInnerHTML={{ __html: log }}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeClient;
