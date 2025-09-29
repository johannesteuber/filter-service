"use client";

import { filter } from "@/filter/filter";
import { useEffect } from "react";
import { AccessFile, Json } from "@/types/types";
import { analyzeApiResult } from "@/filter/analyze-api-result";
import { fetchDatentreuObjectAccessRule } from "./actions/datentreu-access";
import { AccessRightsSelection } from "../components/AccessRightsSelection";
import { OutputEditor } from "../components/OutputEditor";
import { ApiFileEditor } from "../components/ApiFileEditor";
import { ApiSchemaEditor } from "../components/ApiSchemaEditor";
import { AccessFileEditor } from "../components/AccessFileEditor";
import { AccessFileSchema, AccessRuleSchema } from "../schemas/access-rule-schema";
import {
  transformPolicyMachineAccessRights,
  transformPolicyMachineDigitsAccess,
  transformPolicyMachinePseudonymization,
} from "../policy-machine/transform-policy-machine-results";
import { useAppContext } from "./contexts/AppContext";
import { ApiFileSelection } from "@/components/ApiFileSelection";
import { ApiSchemaFileSchema } from "@/schemas/api-file-schema-schema";
import z from "zod";
import { Logs } from "@/components/Logs";

const HomeClient = () => {
  const {
    accessTargets,
    datentreuAccessToken,
    datentreuApplicationId,
    accessFileType,
    datentreuIdentityId,
    accessFile,
    apiFile,
    apiSchemaFile,
    setAccessTargets,
    setAccessFile,
    setOutput,
    setError,
    setIsLoading,
    setLogs,
    setFilterTime,
    displayError,
  } = useAppContext();

  function parseFile(obj: string, name: string): Json | undefined;
  function parseFile<T extends z.ZodTypeAny>(obj: string, name: string, schema: T): z.infer<T> | undefined;
  function parseFile<T extends z.ZodTypeAny>(obj: string, name: string, schema?: T): z.infer<T> | Json | undefined {
    if (obj.trim() === "") return undefined;
    try {
      const json = JSON.parse(obj);
      if (!schema) return json;
      return schema.parse(json);
    } catch (e) {
      displayError(`invalid ${name}`, e);
    }
  }

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
  // FETCH ACCESS RIGHTS IF ACCESS FILE TYPE IS DATENTREU
  // => sets AccessFile
  //
  useEffect(() => {
    const fetchAccessRights = async () => {
      if (!datentreuAccessToken || !datentreuApplicationId || !datentreuIdentityId) {
        return;
      }
      setIsLoading((prev) => ({
        ...prev,
        access: true,
      }));
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
          console.error("access rights not found", e);
        }
      }
      setAccessFile(JSON.stringify(accessRights, null, 2));
      setIsLoading((prev) => ({
        ...prev,
        access: false,
      }));
      /*
        // ENDPOINT CURRENTLY NOT WORKING (because of body in GET request)
        const rules = await fetchDatentreuObjectAccessRules({
          accessToken: datentreuAccessToken,
          applicationId: datentreuApplicationId,
          identityId: datentreuIdentityId,
          objectIds: objectIdentifiers.filter((o) => o.type === "id").map((o) => o.id),
        });
        */
    };

    if (accessFileType === "datentreu") {
      fetchAccessRights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessTargets, accessFileType, datentreuAccessToken, datentreuApplicationId, datentreuIdentityId]);

  //
  // FILTER
  //
  useEffect(() => {
    const parsedAccessJson = parseFile(accessFile, "access file", AccessFileSchema);
    const apiJSON = parseFile(apiFile, "api file");
    const parsedSchemaJson = parseFile(apiSchemaFile, "api schema", ApiSchemaFileSchema);

    if (!parsedAccessJson || !apiJSON) {
      return;
    }

    try {
      const startTime = performance.now();
      const TYPE = "readProperties";

      const { obj: output, logs } = filter({
        accessRights: transformPolicyMachineAccessRights(parsedAccessJson, TYPE),
        digitsAccess: transformPolicyMachineDigitsAccess(parsedAccessJson, TYPE),
        pseudonymization: transformPolicyMachinePseudonymization(parsedAccessJson),
        obj: apiJSON,
        schema: parsedSchemaJson,
      });
      const endTime = performance.now();
      setFilterTime(endTime - startTime);
      setLogs(logs);
      setOutput(output);
      setError("");
    } catch (e) {
      displayError(e instanceof Error ? e.message : "Invalid JSON input");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessFile, apiFile, apiSchemaFile]);

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Filter Service</h1>

      <div className="flex flex-col gap-4">
        <AccessRightsSelection />
        <ApiFileSelection />
      </div>

      <ApiFileEditor />
      <ApiSchemaEditor />
      <AccessFileEditor />
      <OutputEditor />

      <Logs />
    </div>
  );
};

export default HomeClient;
