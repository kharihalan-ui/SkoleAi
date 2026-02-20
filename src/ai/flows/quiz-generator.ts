'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuizGeneratorInputSchema = z.object({
  studyMaterial: z.string().describe('The study material to generate a quiz from.'),
  questionCount: z.number().min(3).max(20).default(5).describe('Number of questions to generate.'),
});
export type QuizGeneratorInput = z.infer<typeof QuizGeneratorInputSchema>;

const QuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
  explanation: z.string(),
});

const QuizGeneratorOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema),
});
export type QuizGeneratorOutput = z.infer<typeof QuizGeneratorOutputSchema>;

export async function generateQuiz(input: QuizGeneratorInput): Promise<QuizGeneratorOutput> {
  return quizGeneratorFlow(input);
}

const quizPrompt = ai.definePrompt({
  name: 'quizGeneratorPrompt',
  input: { schema: QuizGeneratorInputSchema },
  output: { schema: QuizGeneratorOutputSchema },
  prompt: `You are an expert teacher creating multiple-choice quizzes. Generate a quiz based on the study material.

Study Material:
"""
{{{studyMaterial}}}
"""

Create exactly {{{questionCount}}} multiple-choice questions. Each question should have 4 options (A, B, C, D) with one correct answer. Include a brief explanation for each correct answer.

Output format:
{
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The exact text of the correct option",
      "explanation": "Why this is correct"
    }
  ]
}`,
});

const quizGeneratorFlow = ai.defineFlow(
  { name: 'quizGeneratorFlow', inputSchema: QuizGeneratorInputSchema, outputSchema: QuizGeneratorOutputSchema },
  async (input) => {
    const { output } = await quizPrompt(input);
    if (!output) throw new Error('Failed to generate quiz.');
    return output;
  }
);
