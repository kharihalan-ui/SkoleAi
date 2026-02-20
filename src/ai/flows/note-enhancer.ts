'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NoteEnhancerInputSchema = z.object({
  noteContent: z.string().min(20).describe('The raw note content to enhance.'),
  enhancementType: z.enum(['summarize', 'expand', 'clarify', 'addExamples']).describe('Type of enhancement.'),
});
export type NoteEnhancerInput = z.infer<typeof NoteEnhancerInputSchema>;

const NoteEnhancerOutputSchema = z.object({
  enhancedNote: z.string(),
  changes: z.array(z.string()).optional(),
});
export type NoteEnhancerOutput = z.infer<typeof NoteEnhancerOutputSchema>;

export async function enhanceNote(input: NoteEnhancerInput): Promise<NoteEnhancerOutput> {
  return noteEnhancerFlow(input);
}

const enhancementPrompts: Record<string, string> = {
  summarize: 'Create a concise summary with key points highlighted.',
  expand: 'Expand with more detail, explanations, and context.',
  clarify: 'Rewrite for clarity - simpler language, better structure.',
  addExamples: 'Add relevant examples and analogies to illustrate the concepts.',
};

const enhancerPrompt = ai.definePrompt({
  name: 'noteEnhancerPrompt',
  input: { schema: NoteEnhancerInputSchema },
  output: { schema: NoteEnhancerOutputSchema },
  prompt: `You are an expert study assistant. Enhance the following student notes based on the enhancement type.

Enhancement type: {{{enhancementType}}}
- summarize: Create a concise summary with key points highlighted
- expand: Add more detail, explanations, and context
- clarify: Rewrite for clarity - simpler language, better structure
- addExamples: Add relevant examples and analogies

Notes:
"""
{{{noteContent}}}
"""

Return JSON with "enhancedNote" (the improved text) and optionally "changes" (list of what you changed).`,
});

const noteEnhancerFlow = ai.defineFlow(
  { name: 'noteEnhancerFlow', inputSchema: NoteEnhancerInputSchema, outputSchema: NoteEnhancerOutputSchema },
  async (input) => {
    const { output } = await enhancerPrompt(input);
    if (!output) throw new Error('Failed to enhance note.');
    return output;
  }
);
