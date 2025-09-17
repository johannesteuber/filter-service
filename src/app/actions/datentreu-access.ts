"use server";

import { AccessRule } from "@/types/types";

type FetchDatentreuObjectAccessRuleProps = {
  applicationId: string;
  identityId: string;
  accessToken: string;
  objectId: string;
};

export const fetchDatentreuObjectAccessRule = async ({
  applicationId,
  accessToken,
  identityId,
  objectId,
}: FetchDatentreuObjectAccessRuleProps) => {
  const res = await fetch(
    `https://fgac.datentreu.de/application/${applicationId}/access/${objectId}?identityId=${identityId}&requestedById=${identityId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch object id: ${res.statusText}`);
  }
  const json = await res.json();
  return json;
};

type FetchDatentreuObjectAccessRulesProps = {
  applicationId: string;
  identityId: string;
  accessToken: string;
  objectIds: string[];
};

export const fetchDatentreuObjectAccessRules = async ({
  applicationId,
  accessToken,
  identityId,
  objectIds,
}: FetchDatentreuObjectAccessRulesProps) => {
  console.log(`https://fgac.datentreu.de/application/${applicationId}/access/?identityId=${identityId}&requestedById=${identityId}`)
  console.log(objectIds)
  const res = await fetch(
    `https://fgac.datentreu.de/application/${applicationId}/access/?identityId=${identityId}&requestedById=${identityId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",

      },
      body: JSON.stringify({
        objectIds,
      }),
    },
  );
  const json = await res.text();
  console.log(json)
  return json;
};

type SetAccessRulesProps = {
  applicationId: string;
  identityId: string;
  accessToken: string;
  objectId: string;
  accessRule: AccessRule;
  requestedById: string;
};

export const createDatentreuAccessRules = async ({
  applicationId,
  identityId,
  accessToken,
  objectId,
  accessRule,
  requestedById,
}: SetAccessRulesProps) => {
  const res = await fetch(
    `https://fgac.datentreu.de/application/${applicationId}/access/${objectId}?identityId=${identityId}&requestedById=${requestedById}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        readProperties: accessRule.objectProperties.readProperties,
        writeProperties: accessRule.objectProperties.writeProperties,
        shareReadProperties: accessRule.objectProperties.shareReadProperties,
        shareWriteProperties: accessRule.objectProperties.shareWriteProperties,
      }),
    },
  );

  const json = await res.json();
  return json;
};

export const updateDatentreuAccessRules = async ({
  applicationId,
  identityId,
  accessToken,
  objectId,
  accessRule,
  requestedById,
}: SetAccessRulesProps) => {
  const res = await fetch(
    `https://fgac.datentreu.de/application/${applicationId}/access/${objectId}?identityId=${identityId}&requestedById=${requestedById}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        readProperties: accessRule.objectProperties.readProperties,
        writeProperties: accessRule.objectProperties.writeProperties,
        shareReadProperties: accessRule.objectProperties.shareReadProperties,
        shareWriteProperties: accessRule.objectProperties.shareWriteProperties,
      }),
    },
  );

  const json = await res.json();
  return json;
};
