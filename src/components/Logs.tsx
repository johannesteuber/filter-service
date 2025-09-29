import { useAppContext } from "@/app/contexts/AppContext";

export const Logs = () => {
  const { logs } = useAppContext();
  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-bold">Logs</h2>
      {logs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No logs to display.</p>
      ) : (
        <div className="border border-input rounded-md p-4 max-h-60 overflow-y-auto dark:bg-input/30">
          <ul className="list-disc list-inside space-y-1">
            {logs.map((log, index) => (
              <li
                key={index}
                className={`text-sm dark:text-gray-300 break-words ${log.startsWith("access granted") ? "text-blue-500" : log.startsWith("access denied") ? "text-red-500" : ""}`}
                dangerouslySetInnerHTML={{ __html: log }}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
