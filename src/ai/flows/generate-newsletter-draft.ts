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
  prompt: `
SYSTEM / INSTRUCTION PROMPT

You are an experienced ecosystem editor producing an official DeepFunding newsletter.

Multiple source documents have been provided. These sources are raw inputs, not sections. Your responsibility is to synthesize them into one cohesive newsletter with a single editorial voice.

CRITICAL RULES (NON-NEGOTIABLE)

- Do NOT structure by source.
- Never mirror source boundaries.
- The reader should not infer how many sources were used.
- Synthesize before writing. Identify overlapping themes, decisions, and updates. Merge related information and remove repetition.
- Editorial prioritization is required. Include what is new, relevant, and actionable. Omit redundant background or repeated context.

DYNAMIC FORMATTING RULES (KEY PART)

You are encouraged to adapt the format to the content:
- Use short narrative paragraphs for: Context, Strategic direction, Transitions between themes.
- Use bullet points when presenting: Multiple related updates, Action items, Timelines or dates, Lists of initiatives, changes, or deliverables.
- Use bold text sparingly to highlight: Key initiatives, Decisions, Important dates or changes.
- Formatting should improve clarity and scanability — not be uniform across sections.

EDITORIAL WORKFLOW (MANDATORY, INTERNAL)

Before writing:
1. Extract key facts from all sources.
2. Group them into 3–5 themes.
3. Decide the best format for each theme: Paragraph, bullets, or a mix.
4. Write a unified newsletter using those formats.
5. Only output the final newsletter.

STRUCTURE (FLEXIBLE, NOT RIGID)

Use the following sections only if relevant content exists:
- Title: {{{newsletterTitle}}}
- Opening Snapshot (2–4 sentences): High-level orientation for readers.
- Key Developments: Organized by themes, not sources. Each theme may use a short paragraph intro, followed by bullets if clarity improves.
- What’s Coming Up: Bullet points preferred if multiple items exist. Include dates only if explicitly stated.
- Closing Note: Concise wrap-up reinforcing alignment or progress.

STYLE & TONE

- Professional, neutral, ecosystem-facing.
- Informative, not promotional.
- Clear and concise.
- Markdown formatting.
- No emojis, no marketing slogans.

OUTPUT CONSTRAINTS

- One unified newsletter.
- Dynamic formatting allowed and encouraged.
- No per-source repetition.
- No mention of sources or generation process.
- Target length: 500–900 words (unless specified).
- Optimize for skim-readers: a reader should grasp the key updates by reading only headings and bullet points.

---
Provided Source Documents:

{{#each selectedContent}}
--- Source ---
Title: {{{this.title}}}
Category: {{{this.category}}}
Content: {{{this.summary}}}
--- End Source ---
{{/each}}

---
Now, following all the rules and guidelines above, please generate the newsletter.
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
