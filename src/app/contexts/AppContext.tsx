"use client";

import { AccessTargetWithAttributes } from "@/filter/analyze-api-result";
import { Json } from "@/types/types";
import { useTheme } from "@/utils/editor-options";
import React, { useEffect, useState } from "react";

export type AccessFileType = "manual" | "datentreu";

type AppContextType = {
  accessTargets: AccessTargetWithAttributes[];
  datentreuUsername: string;
  datentreuPassword: string;
  datentreuAccessToken: string;
  datentreuApplicationId: string;
  accessFileType: AccessFileType;
  datentreuIdentityId: string;
  datentreuRequestedById: string;
  apiFileURL: string;
  apiSchemaFileURL: string;
  accessFileURL: string;
  accessFile: string;
  apiFile: string;
  apiSchemaFile: string;
  output: Json;
  error: string;
  isLoading: {
    access: boolean;
    api: boolean;
  };
  logs: string[];
  filterTime: number | null;
  theme: string;
  setAccessTargets: React.Dispatch<React.SetStateAction<AccessTargetWithAttributes[]>>;
  setDatentreuUsername: React.Dispatch<React.SetStateAction<string>>;
  setDatentreuPassword: React.Dispatch<React.SetStateAction<string>>;
  setDatentreuAccessToken: React.Dispatch<React.SetStateAction<string>>;
  setDatentreuApplicationId: React.Dispatch<React.SetStateAction<string>>;
  setAccessFileType: React.Dispatch<React.SetStateAction<AccessFileType>>;
  setDatentreuIdentityId: React.Dispatch<React.SetStateAction<string>>;
  setDatentreuRequestedById: React.Dispatch<React.SetStateAction<string>>;
  setAPIFileURL: React.Dispatch<React.SetStateAction<string>>;
  setAPISchemaFileURL: React.Dispatch<React.SetStateAction<string>>;
  setAccessFileURL: React.Dispatch<React.SetStateAction<string>>;
  setAccessFile: React.Dispatch<React.SetStateAction<string>>;
  setAPIFile: React.Dispatch<React.SetStateAction<string>>;
  setAPISchemaFile: React.Dispatch<React.SetStateAction<string>>;
  setOutput: React.Dispatch<React.SetStateAction<Json>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
  setIsLoading: React.Dispatch<
    React.SetStateAction<{
      access: boolean;
      api: boolean;
    }>
  >;
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
  setFilterTime: React.Dispatch<React.SetStateAction<number | null>>;
  displayError: (error: string, e?: unknown) => void;
};

const AppContext = React.createContext<AppContextType>({
  accessTargets: [],
  datentreuUsername: "",
  datentreuPassword: "",
  datentreuAccessToken: "",
  datentreuApplicationId: "",
  accessFileType: "manual",
  datentreuIdentityId: "",
  datentreuRequestedById: "",
  apiFileURL: "",
  apiSchemaFileURL: "",
  accessFileURL: "",
  accessFile: "",
  apiFile: "",
  apiSchemaFile: "",
  output: {},
  error: "",
  isLoading: {
    access: false,
    api: false,
  },
  logs: [],
  filterTime: null,
  theme: "",
  setAccessTargets: () => {},
  setDatentreuUsername: () => {},
  setDatentreuPassword: () => {},
  setDatentreuAccessToken: () => {},
  setDatentreuApplicationId: () => {},
  setAccessFileType: () => {},
  setDatentreuIdentityId: () => {},
  setDatentreuRequestedById: () => {},
  setAPIFileURL: () => {},
  setAPISchemaFileURL: () => {},
  setAccessFileURL: () => {},
  setAccessFile: () => {},
  setAPIFile: () => {},
  setAPISchemaFile: () => {},
  setOutput: () => {},
  setError: () => {},
  setIsLoading: () => {},
  setLogs: () => {},
  setFilterTime: () => {},
  displayError: () => {},
});

export const useAppContext = () => React.useContext(AppContext);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
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

  // update local storage
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

  //
  // FETCH ACCESS FILE IF ACCESS FILE TYPE IS MANUAL
  // => sets AccessFile
  //
  useEffect(() => {
    const fetchAccessRights = async () => {
      setIsLoading((prev) => ({
        ...prev,
        access: true,
      }));

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
    };

    if (accessFileType === "manual") {
      fetchAccessRights();
    }
  }, [accessFileURL, accessFileType]);

  //
  // FETCH API SCHEMA FILE
  //
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
  }, [apiSchemaFileURL]);

  //
  // FETCH API FILE
  //
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

  const displayError = (error: string, e?: unknown) => {
    setOutput({});
    setError(error);
    setLogs([]); // Clear logs on error
    setFilterTime(null); // Clear filter time on error
    if (e) console.error(e);
  };

  return (
    <AppContext.Provider
      value={{
        accessTargets,
        datentreuUsername,
        datentreuPassword,
        datentreuAccessToken,
        datentreuApplicationId,
        accessFileType,
        datentreuIdentityId,
        datentreuRequestedById,
        apiFileURL,
        apiSchemaFileURL,
        accessFileURL,
        accessFile,
        apiFile,
        apiSchemaFile,
        output,
        error,
        isLoading,
        logs,
        filterTime,
        theme,
        setAccessTargets,
        setDatentreuUsername,
        setDatentreuPassword,
        setDatentreuAccessToken,
        setDatentreuApplicationId,
        setAccessFileType,
        setDatentreuIdentityId,
        setDatentreuRequestedById,
        setAPIFileURL,
        setAPISchemaFileURL,
        setAccessFileURL,
        setAccessFile,
        setAPIFile,
        setAPISchemaFile,
        setOutput,
        setError,
        setIsLoading,
        setLogs,
        setFilterTime,
        displayError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
