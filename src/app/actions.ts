
'use server';

import { summarizeLongInput } from '@/ai/flows/summarize-long-inputs';
import { answerQuestionsAboutContent } from '@/ai/flows/answer-questions-about-content';
import { generateNewsletterDraft } from '@/ai/flows/generate-newsletter-draft';
import { processDocumentSource, ProcessDocumentSourceOutput } from '@/ai/flows/process-document-source';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function getSummaryAction(content: string, imageUrl?: string): Promise<{ summary: string; error?: string }> {
  if (!content && !imageUrl) {
    return { summary: '', error: 'Content and image are empty.' };
  }
  try {
    const result = await summarizeLongInput({ content, imageUrl });
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
  documentContent: string,
  imageUrl?: string
): Promise<{ processedSource?: ProcessDocumentSourceOutput; error?: string }> {
  if (!documentContent && !imageUrl) {
    return { error: 'Could not extract text from the file.' };
  }
  try {
    const result = await processDocumentSource({ documentContent, imageUrl });

    // Save to Firestore
    await addDoc(collection(db, "newsletterCollection"), {
        title: result.title,
        summary: result.summary,
        category: result.category,
        content: result.content,
        imageUrl: result.imageUrl,
        createdAt: new Date().toISOString(),
    });

    return { processedSource: result };
  } catch (error: any) {
    console.error('Error processing document:', error);
    const message = error.message || 'Failed to process document. Please try again.';
    return { error: message };
  }
}
