// src/ai/flows/answer-questions-about-content.ts
'use server';

/**
 * @fileOverview A question answering AI agent for aggregated content.
 *
 * - answerQuestionsAboutContent - A function that answers questions about aggregated content.
 * - AnswerQuestionsAboutContentInput - The input type for the answerQuestionsAboutContent function.
 * - AnswerQuestionsAboutContentOutput - The return type for the answerQuestionsAboutContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionsAboutContentInputSchema = z.object({
  question: z.string().describe('The question to answer about the content.'),
  content: z.string().describe('The aggregated content to answer the question from. Each source may include a Title, Content, a URL, and an imageUrl.'),
});
export type AnswerQuestionsAboutContentInput = z.infer<typeof AnswerQuestionsAboutContentInputSchema>;

const AnswerQuestionsAboutContentOutputSchema = z.object({
  answer: z.string().describe('The answer to the question based on the content.'),
  imageUrl: z.string().optional().describe('The URL of the most relevant image from the content repository that helps answer the question, if applicable.'),
});
export type AnswerQuestionsAboutContentOutput = z.infer<typeof AnswerQuestionsAboutContentOutputSchema>;

export async function answerQuestionsAboutContent(
  input: AnswerQuestionsAboutContentInput
): Promise<AnswerQuestionsAboutContentOutput> {
  return answerQuestionsAboutContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionsAboutContentPrompt',
  input: {schema: AnswerQuestionsAboutContentInputSchema},
  output: {schema: AnswerQuestionsAboutContentOutputSchema},
  prompt: `You are an AI assistant that answers questions based on a repository of content.
Your task is to synthesize an answer from the provided sources.
If a source has a URL, and the user's question implies they might want a link (e.g., asking "where can I find the document?"), include the URL in your answer.
If a source has an associated image (imageUrl) that is relevant to the user's question, include the imageUrl in your response.

Content Repository:
{{{content}}}

Question: {{{question}}}

Synthesized Answer:`,
});

const answerQuestionsAboutContentFlow = ai.defineFlow(
  {
    name: 'answerQuestionsAboutContentFlow',
    inputSchema: AnswerQuestionsAboutContentInputSchema,
    outputSchema: AnswerQuestionsAboutContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
