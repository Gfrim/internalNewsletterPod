
import { NextResponse } from 'next/server';
import { processDocumentSource } from '@/ai/flows/process-document-source';
import { mockSources } from '@/lib/data';
import type { Source } from '@/lib/types';

export async function POST(request: Request) {
  const { INGEST_API_KEY } = process.env;
  if (!INGEST_API_KEY) {
    return NextResponse.json(
        { error: 'Server is not configured for ingestion. Missing INGEST_API_KEY.' },
        { status: 500 }
    );
  }

  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${INGEST_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { documentContent, url } = body;

    if (!documentContent) {
      return NextResponse.json({ error: 'documentContent is required' }, { status: 400 });
    }

    const processedSource = await processDocumentSource({ documentContent });

    const newSource: Source = {
      id: crypto.randomUUID(),
      ...processedSource,
      url: url,
      createdAt: new Date().toISOString(),
    };

    // In a real application, you would save this to a database.
    // For this demo, we'll add it to the in-memory mock data array.
    mockSources.unshift(newSource);

    return NextResponse.json({
      message: 'Source ingested successfully',
      source: {
        id: newSource.id,
        title: newSource.title,
        category: newSource.category,
      }
    }, { status: 201 });

  } catch (e: any) {
    console.error('Ingestion failed:', e);
    return NextResponse.json(
        { error: 'Failed to process request.', details: e.message },
        { status: 500 }
    );
  }
}
