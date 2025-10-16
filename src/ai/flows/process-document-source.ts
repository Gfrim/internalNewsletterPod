
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
  documentContent: z.string().optional().describe('The full text content of the uploaded document.'),
  imageUrl: z.string().optional().describe(
    "An optional image associated with the document, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type ProcessDocumentSourceInput = z.infer<typeof ProcessDocumentSourceInputSchema>;

const ProcessDocumentSourceOutputSchema = z.object({
  title: z.string().describe('A concise and descriptive title for the document.'),
  summary: z.string().describe('A detailed summary that captures all the necessary and key information from the document.'),
  category: z.enum(CATEGORIES).describe(`The most relevant category for the document, from the list: ${CATEGORIES.join(', ')}`),
  circle: z.enum(CIRCLES).describe(`The most relevant circle for the document, from the list: ${CIRCLES.join(', ')}`),
  content: z.string().optional().describe('The original content of the document.'),
  imageUrl: z.string().optional().describe('The data URI of the associated image, if provided.'),
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
    
    Read the following document content and analyze the associated image (if provided). Then, perform these tasks:
    1.  Create a concise, descriptive title for the document. If no content is provided, title it based on the image.
    2.  Write a detailed summary that captures all the necessary and key information from the provided text and image.
    3.  Assign the most appropriate category from the following list: ${CATEGORIES.join(', ')}.
    4.  Assign the most appropriate circle from the following list: ${CIRCLES.join(', ')}.
    5.  Return the original content and image URL.

    {{#if imageUrl}}
    Image / File Attachment:
    {{media url=imageUrl}}
    {{/if}}
    
    {{#if documentContent}}
    Document Content:
    {{{documentContent}}}
    {{/if}}
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
    return {...output!, content: input.documentContent, imageUrl: input.imageUrl};
  }
);
