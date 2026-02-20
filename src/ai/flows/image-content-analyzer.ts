'use server';
/**
 * @fileOverview An AI agent that analyzes image content, either describing the image or extracting text from it.
 *
 * - analyzeImageContent - A function that handles the image content analysis process.
 * - ImageContentAnalyzerInput - The input type for the analyzeImageContent function.
 * - ImageContentAnalyzerOutput - The return type for the analyzeImageContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ImageContentAnalyzerInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of study material, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z
    .string()
    .describe(
      'A prompt instructing the AI to either describe the image or extract text from it.'
    ),
});
export type ImageContentAnalyzerInput = z.infer<
  typeof ImageContentAnalyzerInputSchema
>;

const ImageContentAnalyzerOutputSchema = z.object({
  analysisResult: z.string().describe('The AI-generated description or extracted text from the image.'),
});
export type ImageContentAnalyzerOutput = z.infer<
  typeof ImageContentAnalyzerOutputSchema
>;

export async function analyzeImageContent(
  input: ImageContentAnalyzerInput
): Promise<ImageContentAnalyzerOutput> {
  return imageContentAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageContentAnalyzerPrompt',
  input: { schema: ImageContentAnalyzerInputSchema },
  output: { schema: ImageContentAnalyzerOutputSchema },
  prompt: `You are an AI assistant specialized in analyzing study materials. Your task is to accurately respond to the user's prompt regarding the provided image.

User's Request: {{{prompt}}}
Image: {{media url=photoDataUri}}`,
});

const imageContentAnalyzerFlow = ai.defineFlow(
  {
    name: 'imageContentAnalyzerFlow',
    inputSchema: ImageContentAnalyzerInputSchema,
    outputSchema: ImageContentAnalyzerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to get a response from the AI model.');
    }
    return output;
  }
);
