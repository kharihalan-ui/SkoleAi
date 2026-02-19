'use server';
/**
 * @fileOverview An AI academic chat assistant flow that answers student questions.
 *
 * - academicChatAssistant - A function that handles academic questions and provides answers.
 * - AcademicChatAssistantInput - The input type for the academicChatAssistant function.
 * - AcademicChatAssistantOutput - The return type for the academicChatAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AcademicChatAssistantInputSchema = z
  .string()
  .describe('The academic question to ask the AI.');
export type AcademicChatAssistantInput = z.infer<
  typeof AcademicChatAssistantInputSchema
>;

const AcademicChatAssistantOutputSchema = z
  .string()
  .describe('The AI\'s answer to the academic question.');
export type AcademicChatAssistantOutput = z.infer<
  typeof AcademicChatAssistantOutputSchema
>;

export async function academicChatAssistant(
  input: AcademicChatAssistantInput
): Promise<AcademicChatAssistantOutput> {
  return academicChatAssistantFlow(input);
}

const academicChatAssistantPrompt = ai.definePrompt({
  name: 'academicChatAssistantPrompt',
  input: {schema: AcademicChatAssistantInputSchema},
  output: {schema: AcademicChatAssistantOutputSchema},
  prompt: `You are an AI academic tutor. Your goal is to provide clear, concise, and helpful answers to academic questions. Explain concepts thoroughly, break down complex topics, and offer additional context or examples where appropriate.

Student's Question: {{{input}}}`,
});

const academicChatAssistantFlow = ai.defineFlow(
  {
    name: 'academicChatAssistantFlow',
    inputSchema: AcademicChatAssistantInputSchema,
    outputSchema: AcademicChatAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await academicChatAssistantPrompt(input);
    return output!;
  }
);
