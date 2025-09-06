// /src/app/api/unstructured/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    // The 'unstructured-client' library expects the API to be at this endpoint.
    // It will send a FormData object with the file to be processed.
    // We forward this to the actual Unstructured API.

    // You must provide your own Unstructured API key.
    // You can get one for free at https://unstructured.io.
    const UNSTRUCTURED_API_KEY = process.env.UNSTRUCTURED_API_KEY;

    if (!UNSTRUCTURED_API_KEY) {
      throw new Error("UNSTRUCTURED_API_KEY is not set");
    }

    const response = await fetch("https://api.unstructured.io/general/v0/general", {
      method: "POST",
      headers: {
        "unstructured-api-key": UNSTRUCTURED_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Unstructured API error:", errorText);
      return NextResponse.json({ error: `Unstructured API Error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Error in Unstructured proxy API:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}

    