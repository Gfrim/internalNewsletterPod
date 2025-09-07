
import { NextResponse } from 'next/server';
import { processDocumentSource } from '@/ai/flows/process-document-source';
import type { Source } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc } from "firebase/firestore"; 

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

    // Save to Firestore
    const docRef = await addDoc(collection(db, "sources"), {
      ...processedSource,
      url: url || '',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      message: 'Source ingested successfully',
      source: {
        id: docRef.id,
        title: processedSource.title,
        category: processedSource.category,
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
