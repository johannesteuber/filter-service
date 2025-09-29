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
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="/api/files/productpassport.schema"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
