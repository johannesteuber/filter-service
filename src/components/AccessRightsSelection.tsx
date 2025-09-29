import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { fetchDatenreuAccessToken } from "../app/actions/datentreu-auth";
import { createDatentreuApplication, createDatentreuIdentity } from "../app/actions/datentreu";
import { v4 as uuidv4 } from "uuid";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useAppContext } from "@/app/contexts/AppContext";

export const AccessRightsSelection = () => {
  const {
    accessFileURL,
    datentreuUsername,
    datentreuPassword,
    datentreuAccessToken,
    datentreuApplicationId,
    accessFileType,
    datentreuIdentityId,
    datentreuRequestedById,
    setAccessFileURL,
    setDatentreuUsername,
    setDatentreuPassword,
    setDatentreuAccessToken,
    setDatentreuApplicationId,
    setAccessFileType,
    setDatentreuIdentityId,
    setDatentreuRequestedById,

  } = useAppContext();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Access Rights</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={accessFileType}
          onValueChange={(value) => setAccessFileType(value as "manual" | "datentreu")}
          className="mb-4"
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value="manual" id="manual" />
            <Label htmlFor="manual">Manual</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="datentreu" id="datentreu" />
            <Label htmlFor="datentreu">Datentreu</Label>
          </div>
        </RadioGroup>
        {accessFileType === "manual" && (
          <div className="flex-1 space-y-2">
            <Label htmlFor="accessFileURL">Access File URL</Label>

            <Input
              id="accessFileURL"
              type="text"
              value={accessFileURL}
              onChange={(e) => setAccessFileURL(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="/api/files/access_full"
            />
          </div>
        )}

        {accessFileType === "datentreu" && (
          <div className="flex flex-col gap-5">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="datentreuUsername">Datentreu Username</Label>
                <Input
                  id="datentreuUsername"
                  type="text"
                  value={datentreuUsername}
                  onChange={(e) => setDatentreuUsername(e.target.value)}
                ></Input>
              </div>

              <div className="flex-1 space-y-2">
                <Label htmlFor="datentreuPassword">Datentreu Password</Label>
                <Input
                  id="datentreuPassword"
                  type="password"
                  value={datentreuPassword}
                  onChange={(e) => setDatentreuPassword(e.target.value)}
                ></Input>
              </div>
              <Button
                className="mt-auto "
                onClick={async () => {
                  try {
                    const res = await fetchDatenreuAccessToken(datentreuUsername, datentreuPassword);
                    setDatentreuAccessToken(res.access_token);
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                Retrieve Access Token
              </Button>
            </div>

            <div className="flex gap-4">
              <div className="space-y-2 w-full">
                <Label htmlFor="datentreuAccessToken">Datentreu Access Token</Label>
                <Input
                  id="datentreuAccessToken"
                  type="text"
                  value={datentreuAccessToken}
                  onChange={(e) => setDatentreuAccessToken(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="space-y-2 w-full">
                <Label htmlFor="datentreuRequestedById">Datentreu Requested By Identity Id</Label>
                <Input
                  id="datentreuRequestedById"
                  type="text"
                  value={datentreuRequestedById}
                  onChange={(e) => setDatentreuRequestedById(e.target.value)}
                />
              </div>
              <Button
                className="mt-auto"
                onClick={async () => {
                  let uuid = "";
                  if (!datentreuRequestedById) {
                    uuid = uuidv4();
                    setDatentreuRequestedById(uuid);
                  }
                  try {
                    const res = await createDatentreuIdentity(datentreuRequestedById || uuid, datentreuAccessToken);
                    console.log(res);
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                Create Requested By Identity
              </Button>
            </div>

            <div className="flex gap-4">
              <div className="space-y-2 w-full">
                <Label htmlFor="datentreuIdentityId">Datentreu Identity Id</Label>
                <Input
                  id="datentreuIdentityId"
                  type="text"
                  value={datentreuIdentityId}
                  onChange={(e) => setDatentreuIdentityId(e.target.value)}
                />
              </div>
              <Button
                className="mt-auto"
                onClick={async () => {
                  let uuid = "";
                  if (!datentreuIdentityId) {
                    uuid = uuidv4();
                    setDatentreuIdentityId(uuid);
                  }
                  try {
                    const res = await createDatentreuIdentity(datentreuIdentityId || uuid, datentreuAccessToken);
                    console.log(res);
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                Create Identity
              </Button>
            </div>

            <div className="flex gap-4">
              <div className="space-y-2 w-full">
                <Label htmlFor="datentreuApplicationId">Datentreu Application Id</Label>
                <Input
                  id="datentreuApplicationId"
                  type="text"
                  value={datentreuApplicationId}
                  onChange={(e) => setDatentreuApplicationId(e.target.value)}
                />
              </div>
              <Button
                className="mt-auto"
                onClick={async () => {
                  if (!datentreuIdentityId) {
                    alert("Please set a Datentreu Identity Id");
                    return;
                  }
                  let uuid = "";
                  if (!datentreuApplicationId) {
                    uuid = uuidv4();
                    setDatentreuApplicationId(uuid);
                  }
                  try {
                    const res = await createDatentreuApplication(
                      datentreuApplicationId || uuid,
                      datentreuRequestedById,
                      datentreuAccessToken,
                    );
                    console.log(res);
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                Create Application
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
