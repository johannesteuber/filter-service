"use server";

import { DatentreuAccessRight } from "@/types/types";

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
    console.log(await res.json());
    throw new Error(`Failed to fetch object id`);
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
  console.log(json);
  return json;
};

export type DatentreuAccessBody = DatentreuAccessRight["objectProperties"] & {
  digitsAccess: DatentreuAccessRight["objectProperties"]["digitsAccess"];
};

type SetAccessRulesProps = {
  applicationId: string;
  identityId: string;
  accessToken: string;
  objectId: string;
  accessRules: DatentreuAccessBody;
  requestedById: string;
};

export const createDatentreuAccessRules = async ({
  applicationId,
  identityId,
  accessToken,
  objectId,
  accessRules,
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
      body: JSON.stringify(accessRules),
    },
  );

  const json = await res.json();
  console.log("createDatentreuAccessRules", json);
  return json;
};

export const updateDatentreuAccessRules = async ({
  applicationId,
  identityId,
  accessToken,
  objectId,
  accessRules,
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
      body: JSON.stringify(accessRules),
    },
  );

  const json = await res.json();
  return json;
};
