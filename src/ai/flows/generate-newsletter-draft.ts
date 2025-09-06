'use server';

/**
 * @fileOverview This file defines the Genkit flow for generating a draft newsletter from selected and summarized content.
 *
 * - generateNewsletterDraft - A function that takes in summarized content and generates a draft newsletter.
 * - GenerateNewsletterDraftInput - The input type for the generateNewsletterDraft function.
 * - GenerateNewsletterDraftOutput - The return type for the generateNewsletterDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNewsletterDraftInputSchema = z.object({
  selectedContent: z.array(
    z.object({
      title: z.string().describe('The title of the content.'),
      summary: z.string().describe('The summarized content.'),
      category: z.string().describe('The category of the content (e.g., wins, challenges).'),
    })
  ).describe('An array of selected and summarized content items.'),
  newsletterTitle: z.string().describe('The desired title for the newsletter.'),
});

export type GenerateNewsletterDraftInput = z.infer<typeof GenerateNewsletterDraftInputSchema>;

const GenerateNewsletterDraftOutputSchema = z.object({
  draftNewsletter: z.string().describe('The generated draft newsletter.'),
});

export type GenerateNewsletterDraftOutput = z.infer<typeof GenerateNewsletterDraftOutputSchema>;

export async function generateNewsletterDraft(input: GenerateNewsletterDraftInput): Promise<GenerateNewsletterDraftOutput> {
  return generateNewsletterDraftFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNewsletterDraftPrompt',
  input: {schema: GenerateNewsletterDraftInputSchema},
  output: {schema: GenerateNewsletterDraftOutputSchema},
  prompt: `You are an expert newsletter writer.

  Using the selected content provided, generate a draft newsletter with the title "{{{newsletterTitle}}}".  Organize the content by category.

  Here is the content:
  {{#each selectedContent}}
    Category: {{{this.category}}}
    Title: {{{this.title}}}
    Summary: {{{this.summary}}}

  {{/each}}
  `,
});

const generateNewsletterDraftFlow = ai.defineFlow(
  {
    name: 'generateNewsletterDraftFlow',
    inputSchema: GenerateNewsletterDraftInputSchema,
    outputSchema: GenerateNewsletterDraftOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
