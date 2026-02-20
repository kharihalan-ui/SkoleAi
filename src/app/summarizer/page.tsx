'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { summarizeText, type TextSummarizerOutput } from '@/ai/flows/text-summarizer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  text: z.string().min(100, { message: 'Text must be at least 100 characters.' }),
  summaryLength: z.enum(['brief', 'medium', 'detailed']),
});

export default function SummarizerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TextSummarizerOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: '', summaryLength: 'medium' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await summarizeText(values);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to summarize.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in-50 duration-500">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">Text Summarizer</h1>
        <p className="text-muted-foreground mt-2">
          Summarize long articles, chapters, or notes in seconds.
        </p>
      </header>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text to Summarize</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Paste your long text here..." className="min-h-[220px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summaryLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary Length</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="brief">Brief (2-3 sentences)</SelectItem>
                        <SelectItem value="medium">Medium (paragraph)</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                {isLoading ? 'Summarizing...' : 'Summarize'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
          <h2 className="text-2xl font-headline font-semibold">Summary</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground whitespace-pre-wrap">{result.summary}</p>
            </CardContent>
          </Card>
          {result.keyPoints && result.keyPoints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Points</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {result.keyPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
