import { Label } from "@radix-ui/react-label";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { useAppContext } from "@/app/contexts/AppContext";

export const ApiFileSelection = () => {
  const { apiFileURL, setAPIFileURL, apiSchemaFileURL, setAPISchemaFileURL } = useAppContext();
  return (
    <Card>
      <CardContent>
        <div className="flex gap-4">
          <div className="space-y-2 w-full">
            <Label htmlFor="apiFileURL">API File URL</Label>

            <Input
              id="apiFileURL"
              type="text"
              value={apiFileURL}
              onChange={(e) => setAPIFileURL(e.target.value)}
              placeholder="/api/files/productpassport"
            />
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="apiFileURL">API Schema File URL</Label>
            <Input
              id="apiSchemaURL"
              type="text"
              value={apiSchemaFileURL}
              onChange={(e) => setAPISchemaFileURL(e.target.value)}
              placeholder="/api/files/productpassport.schema"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
