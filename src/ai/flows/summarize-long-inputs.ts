// Summarize Long Inputs Flow
'use server';

/**
 * @fileOverview Summarizes long documents, meeting transcripts, and event notes into concise updates using generative AI.
 *
 * - summarizeLongInput - A function that handles the summarization process.
 * - SummarizeLongInputInput - The input type for the summarizeLongInput function.
 * - SummarizeLongInputOutput - The return type for the summarizeLongInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLongInputInputSchema = z.object({
  content: z.string().describe('The long content to be summarized, such as a document, meeting transcript, or event notes.'),
  imageUrl: z.string().optional().describe(
    "An optional image associated with the content, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type SummarizeLongInputInput = z.infer<typeof SummarizeLongInputInputSchema>;

const SummarizeLongInputOutputSchema = z.object({
  summary: z.string().describe('A detailed summary of the input content that captures all necessary information.'),
});
export type SummarizeLongInputOutput = z.infer<typeof SummarizeLongInputOutputSchema>;

export async function summarizeLongInput(input: SummarizeLongInputInput): Promise<SummarizeLongInputOutput> {
  return summarizeLongInputFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLongInputPrompt',
  input: {schema: SummarizeLongInputInputSchema},
  output: {schema: SummarizeLongInputOutputSchema},
  prompt: `Summarize the following content. If an image is provided, incorporate details from the image into the summary. Create a detailed summary that is comprehensive and captures all necessary and key information, while still being suitable for a newsletter format.

{{#if imageUrl}}
Image:
{{media url=imageUrl}}
{{/if}}

Content:
{{{content}}}`,
});

const summarizeLongInputFlow = ai.defineFlow(
  {
    name: 'summarizeLongInputFlow',
    inputSchema: SummarizeLongInputInputSchema,
    outputSchema: SummarizeLongInputOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
