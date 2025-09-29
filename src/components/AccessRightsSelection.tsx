import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { fetchDatenreuAccessToken } from "../app/actions/datentreu-auth";
import { createDatentreuApplication, createDatentreuIdentity } from "../app/actions/datentreu";
import { v4 as uuidv4 } from "uuid";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useAppContext } from "@/app/contexts/AppContext";
import { fetchDatentreuObjectAccessRule } from "@/app/actions/datentreu-access";
import { DatentreuAccessRight } from "@/types/types";
import { DatentreuAccessRightsSchema } from "@/schemas/datentreu-access-rule-schema";
import { transformPolicyMachineAccessRights } from "@/policy-machine/transform-policy-machine-results";

export const AccessRightsSelection = () => {
  const {
    accessFileURL,
    datentreuUsername,
    datentreuPassword,
    datentreuAccessToken,
    datentreuApplicationId,
    accessRightsSource,
    datentreuOtherIdentityId,
    datentreuOwnerIdentityId,
    accessTargets,
    setAccessFileURL,
    setDatentreuUsername,
    setDatentreuPassword,
    setDatentreuAccessToken,
    setDatentreuApplicationId,
    setAccessRightsSource,
    setDatentreuOtherIdentityId,
    setDatentreuOwnerIdentityId,
    setIsLoading,
    setAccessRights,
  } = useAppContext();

  //
  // FETCH ACCESS RIGHTS IF ACCESS FILE TYPE IS DATENTREU
  // => sets AccessFile
  //
  const fetchDatentreuAccessRights = async () => {
    if (!datentreuAccessToken || !datentreuApplicationId || !datentreuOwnerIdentityId || !datentreuOtherIdentityId) {
      alert("Please set a Datentreu Access Token, Application Id, Owner Identity Id and Other Identity Id");
    }
    setIsLoading((prev) => ({
      ...prev,
      access: true,
    }));
    const datentreuAccessRights: DatentreuAccessRight[] = [];

    for (const accessTarget of accessTargets) {
      if (!accessTarget.id || typeof accessTarget.id !== "string") continue;
      try {
        const res = await fetchDatentreuObjectAccessRule({
          accessToken: datentreuAccessToken,
          applicationId: datentreuApplicationId,
          identityId: datentreuOtherIdentityId,
          objectId: accessTarget.id,
        });
        console.log(res)
        const rule = DatentreuAccessRightsSchema.parse(res);
        datentreuAccessRights.push(rule);
        console.log(res);
      } catch (e) {
        console.error("access rights not found", e);
      }
    }
    const accessRights = transformPolicyMachineAccessRights(datentreuAccessRights, "readProperties");
    setAccessRights(JSON.stringify(accessRights));

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Access Rights</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={accessRightsSource}
          onValueChange={(value) => setAccessRightsSource(value as "manual" | "datentreu")}
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
        {accessRightsSource === "manual" && (
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

        {accessRightsSource === "datentreu" && (
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
                <Label htmlFor="datentreuOtherIdentityId">Datentreu Other Identity Id</Label>
                <Input
                  id="datentreuOtherIdentityId"
                  type="text"
                  value={datentreuOtherIdentityId}
                  onChange={(e) => setDatentreuOtherIdentityId(e.target.value)}
                />
              </div>
              <Button
                className="mt-auto"
                onClick={async () => {
                  const uuid = uuidv4();
                  try {
                    const res = await createDatentreuIdentity(uuid, datentreuAccessToken);
                    setDatentreuOtherIdentityId(uuid);

                    console.log(res);
                  } catch (e) {
                    console.error(e);
                    setDatentreuOtherIdentityId("");
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
                  id="datentreuOwnerIdentityId"
                  type="text"
                  value={datentreuOwnerIdentityId}
                  onChange={(e) => setDatentreuOwnerIdentityId(e.target.value)}
                />
              </div>
              <Button
                className="mt-auto"
                onClick={async () => {
                  const uuid = uuidv4();
                  setDatentreuOwnerIdentityId(uuid);

                  try {
                    const res = await createDatentreuIdentity(uuid, datentreuAccessToken);
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
                  if (!datentreuOwnerIdentityId) {
                    alert("Please set a Datentreu Owner Identity Id");
                    return;
                  }
                  const uuid = uuidv4();

                  try {
                    const res = await createDatentreuApplication(uuid, datentreuOwnerIdentityId, datentreuAccessToken);
                    setDatentreuApplicationId(uuid);

                    console.log(res);
                  } catch (e) {
                    console.error(e);
                    setDatentreuApplicationId("");
                  }
                }}
              >
                Create Application
              </Button>
            </div>

            <Button onClick={fetchDatentreuAccessRights}>Fetch Access Rights</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
