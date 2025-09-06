'use server';

/**
 * @fileOverview Processes an uploaded document to automatically extract a title,
 * generate a summary, and determine the most appropriate category.
 *
 * - processDocumentSource - A function that handles the document processing.
 * - ProcessDocumentSourceInput - The input type for the processDocumentSource function.
 * - ProcessDocumentSourceOutput - The return type for the processDocumentSource function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { CATEGORIES, Category } from '@/lib/types';

const ProcessDocumentSourceInputSchema = z.object({
  documentContent: z.string().describe('The full text content of the uploaded document.'),
});
export type ProcessDocumentSourceInput = z.infer<typeof ProcessDocumentSourceInputSchema>;

const ProcessDocumentSourceOutputSchema = z.object({
  title: z.string().describe('A concise and descriptive title for the document.'),
  summary: z.string().describe('A concise summary of the document\'s content.'),
  category: z.enum(CATEGORIES).describe('The most relevant category for the document.'),
  content: z.string().describe('The original content of the document.'),
});
export type ProcessDocumentSourceOutput = z.infer<typeof ProcessDocumentSourceOutputSchema>;

export async function processDocumentSource(
  input: ProcessDocumentSourceInput
): Promise<ProcessDocumentSourceOutput> {
  return processDocumentSourceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processDocumentSourcePrompt',
  input: {schema: ProcessDocumentSourceInputSchema},
  output: {schema: ProcessDocumentSourceOutputSchema},
  prompt: `You are an expert at analyzing and categorizing business documents.
    
    Read the following document content and perform these tasks:
    1.  Create a concise, descriptive title for the document.
    2.  Write a brief summary of the key information.
    3.  Assign the most appropriate category from the following list: ${CATEGORIES.join(', ')}.
    4.  Return the original content.

    Document Content:
    {{{documentContent}}}
    `,
});

const processDocumentSourceFlow = ai.defineFlow(
  {
    name: 'processDocumentSourceFlow',
    inputSchema: ProcessDocumentSourceInputSchema,
    outputSchema: ProcessDocumentSourceOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return {...output!, content: input.documentContent};
  }
);
