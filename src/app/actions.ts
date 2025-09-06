'use server';

import { summarizeLongInput } from '@/ai/flows/summarize-long-inputs';
import { answerQuestionsAboutContent } from '@/ai/flows/answer-questions-about-content';
import { generateNewsletterDraft } from '@/ai/flows/generate-newsletter-draft';
import { processDocumentSource, ProcessDocumentSourceOutput } from '@/ai/flows/process-document-source';
import type { Source } from '@/lib/types';

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

export async function processDocumentAction(
  documentContent: string
): Promise<{ processedSource?: ProcessDocumentSourceOutput; error?: string }> {
  if (!documentContent) {
    return { error: 'Document content is empty.' };
  }
  try {
    const result = await processDocumentSource({ documentContent });
    return { processedSource: result };
  } catch (error) {
    console.error('Error processing document:', error);
    return { error: 'Failed to process document. The AI may have been unable to extract the required information. Please try again.' };
  }
}
