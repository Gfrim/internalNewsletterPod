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
  draftNewsletter: z.string().describe('The generated draft newsletter in Markdown format.'),
});

export type GenerateNewsletterDraftOutput = z.infer<typeof GenerateNewsletterDraftOutputSchema>;

export async function generateNewsletterDraft(input: GenerateNewsletterDraftInput): Promise<GenerateNewsletterDraftOutput> {
  return generateNewsletterDraftFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNewsletterDraftPrompt',
  input: {schema: GenerateNewsletterDraftInputSchema},
  output: {schema: GenerateNewsletterDraftOutputSchema},
  prompt: `You are an expert internal communications editor. Your task is to write a single, cohesive newsletter article by synthesizing the provided information sources.

**CRITICAL INSTRUCTIONS:**
1.  **DO NOT** list the sources separately.
2.  **DO NOT** use the original titles of the sources as headings.
3.  **DO** write one single, continuous article that flows naturally.
4.  **DO** create a new, compelling headline for the newsletter that encapsulates the main themes of all the combined sources.
5.  **DO** weave the key information from each source into a unified narrative. You can mention the different topics, but they should feel like part of the same conversation.
6.  **Output in Markdown format.** Start with the new headline you created.

**Provided Information Sources:**
{{#each selectedContent}}
- **Topic:** {{{this.title}}}
  - **Key Information:** {{{this.summary}}}
{{/each}}

Now, begin writing the single, synthesized newsletter article.
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
