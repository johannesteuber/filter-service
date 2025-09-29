"use server"



export const createDatentreuApplication = async (applicationId: string, identityId: string, accessToken: string) => {
  const res = await fetch(
    `https://fgac.datentreu.de/application`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({

        applicationId,
        applicationName: applicationId,
        identityId

      }),
    },
  );
  if (!res.ok) {
    console.error(await res.json())
    throw new Error(`Failed to create application: ${res.statusText}`)
  }
  const json = await res.json();
  return json
}

export const createDatentreuIdentity = async (identityId: string, accessToken: string) => {
  console.log("create", identityId)
  const res = await fetch(
    `https://fgac.datentreu.de/identity`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identityId,
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`Failed to create identity: ${res.statusText}`)
  }
  const json = await res.json();
  return json
}


