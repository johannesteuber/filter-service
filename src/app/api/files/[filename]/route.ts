import { NextResponse } from "next/server";
import fs from "fs/promises"; // Using the promise-based fs API
import path from "path";

// Update the directory path to match your actual file structure
const JSON_FILES_DIRECTORY = path.join(process.cwd(), "data", "json");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  try {
    // Properly await the params
    const filename = (await params).filename;

    // Sanitize the filename to prevent directory traversal attacks
    const sanitizedFilename = filename
      .replace(/\.\./g, "")
      .replace(/[^a-zA-Z0-9_\-\.]/g, "");

    // Ensure the filename has a .json extension
    const fullFilename = sanitizedFilename.endsWith(".json")
      ? sanitizedFilename
      : `${sanitizedFilename}.json`;

    // Define the path to the JSON file - using the correct directory structure
    const filePath = path.join(JSON_FILES_DIRECTORY, fullFilename);

    // For debugging - log the path being checked
    console.log(`Looking for file at: ${filePath}`);

    // Security check: Ensure the file path is still within our JSON directory
    if (!filePath.startsWith(JSON_FILES_DIRECTORY)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    // Check if the file exists using the async fs.access
    try {
      await fs.access(filePath);
    } catch (e) {
      console.error(e);
      return NextResponse.json(
        {
          error: `File not found: ${fullFilename}. Looking in: ${JSON_FILES_DIRECTORY}`,
        },
        { status: 404 },
      );
    }

    // Read the file asynchronously
    const fileContents = await fs.readFile(filePath, "utf8");

    // Parse the JSON
    const jsonData = JSON.parse(fileContents);

    // Return the JSON with appropriate headers
    return NextResponse.json(jsonData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
      },
    });
  } catch (error) {
    console.error("Error reading JSON file:", error);

    // Return an error response with more details
    return NextResponse.json(
      {
        error: "Failed to load data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
