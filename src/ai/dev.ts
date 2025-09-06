import { config } from 'dotenv';
config();

import '@/ai/flows/answer-questions-about-content.ts';
import '@/ai/flows/generate-newsletter-draft.ts';
import '@/ai/flows/summarize-long-inputs.ts';
import '@/ai/flows/process-document-source.ts';
