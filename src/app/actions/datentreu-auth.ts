"use server"

const ACCESS_TOKEN_URL = "https://auth.datentreu.de/realms/datentreu/protocol/openid-connect/token";

export const fetchDatenreuAccessToken = async (username: string, password: string) => {
  try {
    const res = await fetch(ACCESS_TOKEN_URL, {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "password",
        client_id: "postman",
        username,
        password,
      }),
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch access token: ${res.statusText}`)
    }
    const json = await res.json();
    return json

  } catch (e) {
    console.error(e);
  }
}
