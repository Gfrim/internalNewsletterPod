
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
import { CATEGORIES, Category, CIRCLES, Circle } from '@/lib/types';

const ProcessDocumentSourceInputSchema = z.object({
  documentContent: z.string().describe('The full text content of the uploaded document.'),
});
export type ProcessDocumentSourceInput = z.infer<typeof ProcessDocumentSourceInputSchema>;

const ProcessDocumentSourceOutputSchema = z.object({
  title: z.string().describe('A concise and descriptive title for the document.'),
  summary: z.string().describe('A detailed summary that captures all the necessary and key information from the document.'),
  category: z.enum(CATEGORIES).describe(`The most relevant category for the document, from the list: ${CATEGORIES.join(', ')}`),
  circle: z.enum(CIRCLES).describe(`The most relevant circle for the document, from the list: ${CIRCLES.join(', ')}`),
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
    
    Read the following document content, then perform these tasks:
    1.  Create a concise, descriptive title for the document.
    2.  Write a detailed summary that captures all the necessary and key information.
    3.  Assign the most appropriate category from the following list: ${CATEGORIES.join(', ')}.
    4.  Assign the most appropriate circle from the following list: ${CIRCLES.join(', ')}.

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
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
