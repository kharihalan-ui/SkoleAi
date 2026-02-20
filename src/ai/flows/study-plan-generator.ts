'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudyPlanInputSchema = z.object({
  subject: z.string().describe('The subject or topic to study.'),
  timeframe: z.string().describe('E.g., "1 week", "2 days", "1 month"'),
  currentLevel: z.string().optional().describe('Current knowledge level.'),
});
export type StudyPlanInput = z.infer<typeof StudyPlanInputSchema>;

const StudyDaySchema = z.object({
  day: z.string(),
  focus: z.string(),
  tasks: z.array(z.string()),
  estimatedMinutes: z.number(),
});

const StudyPlanOutputSchema = z.object({
  plan: z.array(StudyDaySchema),
  tips: z.array(z.string()),
});
export type StudyPlanOutput = z.infer<typeof StudyPlanOutputSchema>;

export async function generateStudyPlan(input: StudyPlanInput): Promise<StudyPlanOutput> {
  return studyPlanFlow(input);
}

const studyPlanPrompt = ai.definePrompt({
  name: 'studyPlanPrompt',
  input: { schema: StudyPlanInputSchema },
  output: { schema: StudyPlanOutputSchema },
  prompt: `You are an expert study coach. Create a personalized study plan.

Subject/Topic: {{{subject}}}
Timeframe: {{{timeframe}}}
Current Level: {{{currentLevel}}}

Create a day-by-day study plan. Each day should have:
- A clear focus
- 3-5 specific tasks
- Estimated time in minutes

Also provide 3-5 study tips specific to this subject.`,
});

const studyPlanFlow = ai.defineFlow(
  { name: 'studyPlanFlow', inputSchema: StudyPlanInputSchema, outputSchema: StudyPlanOutputSchema },
  async (input) => {
    const { output } = await studyPlanPrompt(input);
    if (!output) throw new Error('Failed to generate study plan.');
    return output;
  }
);
