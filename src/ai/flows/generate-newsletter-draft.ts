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
  prompt: `You are an expert internal communications editor tasked with creating a draft for a company newsletter.
Your goal is to synthesize the provided content into a single, cohesive, and well-organized newsletter document.

**Instructions:**

1.  **Use the provided title:** Start the newsletter with the title "{{{newsletterTitle}}}".
2.  **Group content by category:** Organize the items under clear headings based on their 'category' (e.g., "Key Wins", "Recent Challenges", "Project Updates").
3.  **Format consistently:** For each item, use its 'title' as a sub-heading and its 'summary' as the body paragraph.
4.  **Create a unified document:** Do not create separate newsletters. Combine all selected content into one single draft.
5.  **Output in Markdown:** Use Markdown for formatting (e.g., '#' for the main title, '##' for category headings, '###' for item titles).

**Content to Include:**
{{#each selectedContent}}
- **Category:** {{{this.category}}}
  - **Title:** {{{this.title}}}
  - **Summary:** {{{this.summary}}}
{{/each}}

Begin the draft now.
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
