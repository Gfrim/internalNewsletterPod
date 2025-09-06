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
  content: z.string().describe('The aggregated content to answer the question from.'),
});
export type AnswerQuestionsAboutContentInput = z.infer<typeof AnswerQuestionsAboutContentInputSchema>;

const AnswerQuestionsAboutContentOutputSchema = z.object({
  answer: z.string().describe('The answer to the question based on the content.'),
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
  prompt: `You are an AI assistant that answers questions based on provided content.\n\nContent: {{{content}}}\n\nQuestion: {{{question}}}\n\nAnswer:`,
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
