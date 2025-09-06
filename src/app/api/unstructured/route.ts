// /src/app/api/unstructured/route.ts
import { NextResponse, NextRequest } from "next/server";
import { UnstructuredClient } from "unstructured-client";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const UNSTRUCTURED_API_KEY = process.env.UNSTRUCTURED_API_KEY;

    if (!UNSTRUCTURED_API_KEY) {
      throw new Error("UNSTRUCTURED_API_KEY is not set");
    }

    const client = new UnstructuredClient({
        apiKey: UNSTRUCTURED_API_KEY,
        // The SDK requires a serverURL, even if it's the default.
        serverURL: "https://api.unstructured.io",
    });

    const resp = await client.general.partition({
        files: {
            content: file,
            fileName: file.name,
        }
    });

    return NextResponse.json(resp.elements);

  } catch (error: any) {
    console.error("Error in Unstructured proxy API:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}
