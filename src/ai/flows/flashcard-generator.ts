'use server';
/**
 * @fileOverview A Genkit flow for generating flashcards from study material.
 *
 * - generateFlashcards - A function that handles the flashcard generation process.
 * - FlashcardGeneratorInput - The input type for the generateFlashcards function.
 * - FlashcardGeneratorOutput - The return type for the generateFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FlashcardGeneratorInputSchema = z.object({
  studyMaterial: z.string().describe('The study material from which to generate flashcards.'),
});
export type FlashcardGeneratorInput = z.infer<typeof FlashcardGeneratorInputSchema>;

const FlashcardSchema = z.object({
  term: z.string().describe('The term for the flashcard.'),
  definition: z.string().describe('The definition or answer for the flashcard term.'),
});

const FlashcardGeneratorOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('An array of generated flashcards.'),
});
export type FlashcardGeneratorOutput = z.infer<typeof FlashcardGeneratorOutputSchema>;

export async function generateFlashcards(input: FlashcardGeneratorInput): Promise<FlashcardGeneratorOutput> {
  return flashcardGeneratorFlow(input);
}

const flashcardPrompt = ai.definePrompt({
  name: 'flashcardGeneratorPrompt',
  input: {schema: FlashcardGeneratorInputSchema},
  output: {schema: FlashcardGeneratorOutputSchema},
  prompt: `You are an AI assistant specialized in creating educational flashcards from provided study material.

Your task is to analyze the given study material and extract key terms and their corresponding definitions or explanations.

Generate a list of flashcards, where each flashcard has a 'term' (front of the card) and a 'definition' (back of the card).
Focus on creating concise and effective flashcards that would help a student review the material.

Study Material:
"""
{{{studyMaterial}}}
"""

Example Output Format:
{
  "flashcards": [
    {
      "term": "Example Term 1",
      "definition": "Definition for Example Term 1."
    },
    {
      "term": "Example Term 2",
      "definition": "Definition for Example Term 2."
    }
  ]
}

Please generate the flashcards in JSON format as specified in the output schema.`,
});

const flashcardGeneratorFlow = ai.defineFlow(
  {
    name: 'flashcardGeneratorFlow',
    inputSchema: FlashcardGeneratorInputSchema,
    outputSchema: FlashcardGeneratorOutputSchema,
  },
  async (input) => {
    const {output} = await flashcardPrompt(input);
    return output!;
  }
);
