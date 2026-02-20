'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TextSummarizerInputSchema = z.object({
  text: z.string().min(100).describe('The text to summarize.'),
  summaryLength: z.enum(['brief', 'medium', 'detailed']).default('medium'),
});
export type TextSummarizerInput = z.infer<typeof TextSummarizerInputSchema>;

const TextSummarizerOutputSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
});
export type TextSummarizerOutput = z.infer<typeof TextSummarizerOutputSchema>;

export async function summarizeText(input: TextSummarizerInput): Promise<TextSummarizerOutput> {
  return textSummarizerFlow(input);
}

const summarizerPrompt = ai.definePrompt({
  name: 'textSummarizerPrompt',
  input: { schema: TextSummarizerInputSchema },
  output: { schema: TextSummarizerOutputSchema },
  prompt: `You are an expert at summarizing text for students. Summarize the following text.

Summary length: {{{summaryLength}}}
- brief: 2-3 sentences only
- medium: one paragraph (4-6 sentences)
- detailed: multiple paragraphs covering all major points

Text to summarize:
"""
{{{text}}}
"""

Provide a JSON object with "summary" (the summary text) and "keyPoints" (array of 5-8 key points as strings).`,
});

const textSummarizerFlow = ai.defineFlow(
  { name: 'textSummarizerFlow', inputSchema: TextSummarizerInputSchema, outputSchema: TextSummarizerOutputSchema },
  async (input) => {
    const { output } = await summarizerPrompt(input);
    if (!output) throw new Error('Failed to summarize.');
    return output;
  }
);
