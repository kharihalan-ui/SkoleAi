'use server';
/**
 * @fileOverview A Genkit flow for transcribing and summarizing video content from a given URL.
 *
 * - summarizeVideoContent - A function that takes a video URL, transcribes its content, and summarizes it.
 * - VideoContentSummarizerInput - The input type for the summarizeVideoContent function.
 * - VideoContentSummarizerOutput - The return type for the summarizeVideoContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const VideoContentSummarizerInputSchema = z.object({
  videoUrl: z.string().url().describe('The URL of the video to be transcribed and summarized.'),
});
export type VideoContentSummarizerInput = z.infer<typeof VideoContentSummarizerInputSchema>;

// Output Schema
const VideoContentSummarizerOutputSchema = z.object({
  transcription: z.string().describe('The full transcription of the video content.'),
  summary: z.string().describe('A concise summary of the video content, highlighting key points.'),
});
export type VideoContentSummarizerOutput = z.infer<typeof VideoContentSummarizerOutputSchema>;

// Prompt definition
const videoSummarizerPrompt = ai.definePrompt({
  name: 'videoContentSummarizerPrompt',
  input: { schema: VideoContentSummarizerInputSchema },
  output: { schema: VideoContentSummarizerOutputSchema },
  prompt: `You are an AI assistant specialized in analyzing video content. Your task is to provide a comprehensive transcription of the video found at the provided URL, followed by a concise summary of its key points.\n\nVideo URL: {{media url=videoUrl}}\n\nPlease output your response as a JSON object with two fields: "transcription" for the full transcribed text, and "summary" for the key points.`,
});

// Flow definition
const videoContentSummarizerFlow = ai.defineFlow(
  {
    name: 'videoContentSummarizerFlow',
    inputSchema: VideoContentSummarizerInputSchema,
    outputSchema: VideoContentSummarizerOutputSchema,
  },
  async (input) => {
    // The `ai.definePrompt` abstraction handles constructing the `ai.generate` call
    // with the video URL as a media part, expecting the multimodal LLM to process it.
    const { output } = await videoSummarizerPrompt(input);
    if (!output) {
      throw new Error('Failed to get a response from the AI model.');
    }
    return output;
  }
);

// Wrapper function for the flow
export async function summarizeVideoContent(input: VideoContentSummarizerInput): Promise<VideoContentSummarizerOutput> {
  return videoContentSummarizerFlow(input);
}
