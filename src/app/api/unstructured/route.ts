// /src/app/api/unstructured/route.ts
import { NextResponse, NextRequest } from "next/server";
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (file.type === 'application/pdf') {
        const data = await pdf(fileBuffer);
        text = data.text;
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        text = result.value;
    } else if (file.type === 'text/plain' || file.type === 'text/markdown' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        text = fileBuffer.toString('utf-8');
    } else {
        return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });
    }

    if (!text) {
        return NextResponse.json({ error: "Could not extract text from the file." }, { status: 500 });
    }

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Error processing file:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}
