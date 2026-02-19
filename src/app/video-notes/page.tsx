'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { summarizeVideoContent, type VideoContentSummarizerOutput } from '@/ai/flows/video-content-summarizer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  videoUrl: z.string().url({
    message: 'Please enter a valid URL.',
  }),
});

export default function VideoNotesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VideoContentSummarizerOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoUrl: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await summarizeVideoContent(values);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to process the video. Please check the URL and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in-50 duration-500">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">Video Study Assistant</h1>
        <p className="text-muted-foreground mt-2">
          Paste a video link to get a summary and full transcription.
        </p>
      </header>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Video URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Wand2 />
                )}
                {isLoading ? 'Processing...' : 'Get Notes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
            <CardHeader>
              <CardTitle>Processing Video...</CardTitle>
              <CardDescription>Our AI is summarizing and transcribing. This might take a minute.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-center p-8">
                 <Loader2 className="h-12 w-12 animate-spin text-primary" />
               </div>
            </CardContent>
          </Card>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
          <h2 className="text-2xl font-headline font-semibold">Video Analysis</h2>
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.summary}</p>
            </CardContent>
          </Card>
          
          <Accordion type="single" collapsible>
            <AccordionItem value="transcription">
              <AccordionTrigger className="text-xl font-headline">Full Transcription</AccordionTrigger>
              <AccordionContent>
                <Card className="bg-secondary/50">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.transcription}</p>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
}
