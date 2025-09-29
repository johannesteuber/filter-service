"use client";

import { filter } from "@/filter/filter";
import { useEffect } from "react";
import { Json } from "@/types/types";
import { analyzeApiResult } from "@/filter/analyze-api-result";
import { AccessRightsSelection } from "../components/AccessRightsSelection";
import { OutputEditor } from "../components/OutputEditor";
import { ApiFileEditor } from "../components/ApiFileEditor";
import { ApiSchemaEditor } from "../components/ApiSchemaEditor";
import { useAppContext } from "./contexts/AppContext";
import { ApiFileSelection } from "@/components/ApiFileSelection";
import { ApiSchemaFileSchema } from "@/schemas/api-file-schema-schema";
import z from "zod";
import { Logs } from "@/components/Logs";
import { writeJsonLog } from "./actions/save-log";
import { AccessRightsEditor } from "@/components/AccessRightsEditor";
import { AccessRightsSchema } from "@/schemas/access-rule-schema";

export function parseFile(obj: string, name: string): Json | undefined;
export function parseFile<T extends z.ZodTypeAny>(obj: string, name: string, schema: T): z.infer<T> | undefined;
export function parseFile<T extends z.ZodTypeAny>(
  obj: string,
  name: string,
  schema?: T,
): z.infer<T> | Json | undefined {
  if (obj.trim() === "") return undefined;
  try {
    const json = JSON.parse(obj);
    if (!schema) return json;
    return schema.parse(json);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    throw new Error(`invalid ${name}`);
  }
}

const HomeClient = () => {
  const {
    apiFile,
    apiSchemaFile,
    accessRights,
    datentreuOtherIdentityId,
    setAccessTargets,
    setOutput,
    setError,
    setLogs,
    setFilterTime,
    displayError,
  } = useAppContext();

  //
  // ANALYZE API FILE FOR ACCESS TARGETS
  //
  useEffect(() => {
    const apiJSON = parseFile(apiFile, "api file");
    const parsedSchemaJson = parseFile(apiSchemaFile, "api schema", ApiSchemaFileSchema);
    if (!apiJSON) {
      return;
    }
    const accessTargets = analyzeApiResult(apiJSON, parsedSchemaJson);
    setAccessTargets(accessTargets);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiFile, apiSchemaFile]);

  //
  // FILTER
  //
  useEffect(() => {
    try {
      const accessRightsParsed = parseFile(accessRights, "access rights", AccessRightsSchema);
      if (!accessRightsParsed) {
        setError("Invalid access rights");
        return;
      }
      const apiJSON = parseFile(apiFile, "api file");
      const parsedSchemaJson = parseFile(apiSchemaFile, "api schema", ApiSchemaFileSchema);

      const startTime = performance.now();

      const originalObject = JSON.parse(JSON.stringify(apiJSON));

      const { doc: output, logs } = filter(apiJSON, accessRightsParsed, parsedSchemaJson);

      const timeStamp = new Date().toISOString();
      const log = {
        originalObject,
        accessRights: accessRightsParsed,
        filteredObject: output,
        logs,
        timeStamp,
        subjectId: datentreuOtherIdentityId ?? undefined,
      };

      writeJsonLog(log, timeStamp + ".json");

      const endTime = performance.now();
      setFilterTime(endTime - startTime);
      setLogs(logs);
      setOutput(output);
      setError("");
    } catch (e) {
      displayError(e instanceof Error ? e.message : "Invalid JSON input");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessRights, apiFile, apiSchemaFile]);

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold">Filterservice</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        developed in the context of the bachelor thesis on the topic:
        <br />
        {'"'}Datentreuhänder: Entwicklung eines generischen Filterservice für JSON-Daten von Web-APIs{'"'}
      </p>

      <div className="flex flex-col gap-4">
        <AccessRightsSelection />
        <ApiFileSelection />
      </div>

      <ApiFileEditor />
      <ApiSchemaEditor />
      <AccessRightsEditor />
      <OutputEditor />

      <Logs />
    </div>
  );
};

export default HomeClient;
