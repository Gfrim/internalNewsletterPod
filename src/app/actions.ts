
'use server';

import { summarizeLongInput } from '@/ai/flows/summarize-long-inputs';
import { answerQuestionsAboutContent } from '@/ai/flows/answer-questions-about-content';
import { generateNewsletterDraft } from '@/ai/flows/generate-newsletter-draft';
import { processDocumentSource, ProcessDocumentSourceOutput } from '@/ai/flows/process-document-source';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export async function getSummaryAction(content: string): Promise<{ summary: string; error?: string }> {
  if (!content) {
    return { summary: '', error: 'Content is empty.' };
  }
  try {
    const result = await summarizeLongInput({ content });
    return { summary: result.summary };
  } catch (error) {
    console.error('Error generating summary:', error);
    return { summary: '', error: 'Failed to generate summary. Please try again.' };
  }
}

export async function getAnswerAction(question: string, context: string): Promise<{ answer: string; error?: string }> {
  if (!question || !context) {
    return { answer: '', error: 'Missing question or context.' };
  }
  try {
    const result = await answerQuestionsAboutContent({ question, content: context });
    return { answer: result.answer };
  } catch (error) {
    console.error('Error getting answer:', error);
    return { answer: '', error: 'I was unable to find an answer. Please try rephrasing your question.' };
  }
}

export async function generateNewsletterAction(
  selectedContent: { title: string; summary: string; category: string }[],
  newsletterTitle: string
): Promise<{ draft: string; error?: string }> {
  if (selectedContent.length === 0) {
    return { draft: '', error: 'No content selected.' };
  }
  try {
    const result = await generateNewsletterDraft({ selectedContent, newsletterTitle });
    return { draft: result.draftNewsletter };
  } catch (error) {
    console.error('Error generating newsletter:', error);
    return { draft: '', error: 'Failed to generate newsletter draft. Please try again.' };
  }
}

export async function processFileUploadAction(
  formData: FormData
): Promise<{ processedSource?: ProcessDocumentSourceOutput; error?: string }> {
  try {
    const file = formData.get('file') as File | null;
    if (!file) {
      return { error: 'No file uploaded.' };
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    let documentContent = '';

    if (file.type === 'application/pdf') {
        const data = await pdf(fileBuffer);
        documentContent = data.text;
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        const { value } = await mammoth.extractRawText({ buffer: fileBuffer });
        documentContent = value;
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        documentContent = fileBuffer.toString('utf-8');
    } else {
      return { error: 'Unsupported file type.' };
    }

    if (!documentContent) {
      return { error: 'Could not extract text from the file.' };
    }
    
    const result = await processDocumentSource({ documentContent });
    return { processedSource: result };
  } catch (error: any) {
    console.error('Error processing document:', error);
    const message = error.message || 'Failed to process document. Please try again.';
    return { error: message };
  }
}

    