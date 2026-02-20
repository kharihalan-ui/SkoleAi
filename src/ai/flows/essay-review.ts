'use server';
/**
 * @fileOverview This file implements a Genkit flow for reviewing essays.
 *
 * - essayReview - A function that reviews an essay for grammar, clarity, and structure.
 * - EssayReviewInput - The input type for the essayReview function.
 * - EssayReviewOutput - The return type for the essayReview function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EssayReviewInputSchema = z.object({
  essayContent: z.string().describe('The full text content of the essay to be reviewed.'),
});
export type EssayReviewInput = z.infer<typeof EssayReviewInputSchema>;

const EssayReviewOutputSchema = z.object({
  grammarFeedback: z.string().describe('Detailed feedback on grammar, punctuation, and spelling.'),
  clarityFeedback: z.string().describe('Detailed feedback on sentence clarity, conciseness, and readability.'),
  structureFeedback: z.string().describe('Detailed feedback on essay structure, organization of paragraphs, and logical flow of arguments.'),
  overallScore: z.number().min(0).max(10).describe('An overall score for the essay out of 10.'),
  suggestionsForImprovement: z.string().describe('Actionable suggestions for improving the essay.'),
});
export type EssayReviewOutput = z.infer<typeof EssayReviewOutputSchema>;

export async function essayReview(input: EssayReviewInput): Promise<EssayReviewOutput> {
  return essayReviewFlow(input);
}

const essayReviewPrompt = ai.definePrompt({
  name: 'essayReviewPrompt',
  input: { schema: EssayReviewInputSchema },
  output: { schema: EssayReviewOutputSchema },
  prompt: `You are an expert essay reviewer, specializing in providing constructive feedback on grammar, clarity, and structure.

Review the following essay and provide detailed feedback for each of the categories below. Also provide an overall score out of 10 and actionable suggestions for improvement.

Essay:
{{{essayContent}}}`,
});

const essayReviewFlow = ai.defineFlow(
  {
    name: 'essayReviewFlow',
    inputSchema: EssayReviewInputSchema,
    outputSchema: EssayReviewOutputSchema,
  },
  async (input) => {
    const { output } = await essayReviewPrompt(input);
    if (!output) {
      throw new Error('Failed to get a response from the AI model.');
    }
    return output;
  }
);
