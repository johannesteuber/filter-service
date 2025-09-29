"use server";

type FetchDatentreuObjectProps = {
  applicationId: string;
  accessToken: string;
  objectId: string;
}


export const fetchDatentreuObject = async ({ applicationId, accessToken, objectId }: FetchDatentreuObjectProps) => {
  const res = await fetch(
    `https://fgac.datentreu.de/application/${applicationId}/object/${objectId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch object id: ${res.statusText}`)

  }
  const json = await res.json();

  return json
}

type CreateDatentreuObjectProps = {
  applicationId: string;
  identityId: string;
  accessToken: string;
  objectId: string;
  objectEntityClass: string;
  properties: string[]
}

export const createDatentreuObject = async ({ applicationId, identityId, accessToken, objectId, objectEntityClass, properties }: CreateDatentreuObjectProps) => {
  const res = await fetch(
    `https://fgac.datentreu.de/application/${applicationId}/object`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identityId,
        objectId,
        objectEntityClass,
        properties,
      }),
    },
  );
  const json = await res.json();
  console.log("createDatentreuObject", json)
  return json
}

export const updateDatentreuObject = async ({ applicationId, identityId, accessToken, objectId, objectEntityClass, properties }: CreateDatentreuObjectProps) => {

  const res = await fetch(
    `https://fgac.datentreu.de/application/${applicationId}/object/${objectId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identityId,
        objectEntityClass,
        properties,
      }),
    },
  );

  const json = await res.json();
  return json
}