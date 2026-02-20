'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MathSolverInputSchema = z.object({
  problem: z.string().min(3).describe('The math problem to solve.'),
});
export type MathSolverInput = z.infer<typeof MathSolverInputSchema>;

const MathSolverOutputSchema = z.object({
  answer: z.string(),
  steps: z.array(z.string()),
  explanation: z.string(),
});
export type MathSolverOutput = z.infer<typeof MathSolverOutputSchema>;

export async function solveMathProblem(input: MathSolverInput): Promise<MathSolverOutput> {
  return mathSolverFlow(input);
}

const mathPrompt = ai.definePrompt({
  name: 'mathSolverPrompt',
  input: { schema: MathSolverInputSchema },
  output: { schema: MathSolverOutputSchema },
  prompt: `You are an expert math tutor. Solve the following math problem step-by-step so a student can understand.

Problem: {{{problem}}}

Provide:
1. The final answer
2. Clear numbered steps showing how to solve it
3. A brief explanation of the approach used

Support: algebra, geometry, calculus, trigonometry, statistics, and basic arithmetic.`,
});

const mathSolverFlow = ai.defineFlow(
  { name: 'mathSolverFlow', inputSchema: MathSolverInputSchema, outputSchema: MathSolverOutputSchema },
  async (input) => {
    const { output } = await mathPrompt(input);
    if (!output) throw new Error('Failed to solve problem.');
    return output;
  }
);
