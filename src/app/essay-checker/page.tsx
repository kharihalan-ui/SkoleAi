'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { essayReview, type EssayReviewOutput } from '@/ai/flows/essay-review';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  essayContent: z.string().min(50, {
    message: 'Essay must be at least 50 characters.',
  }),
});

export default function EssayCheckerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [review, setReview] = useState<EssayReviewOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      essayContent: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setReview(null);
    try {
      const result = await essayReview(values);
      setReview(result);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to review the essay. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">Essay Checker</h1>
        <p className="text-muted-foreground mt-2">
          Paste your essay below and let our AI provide feedback on grammar, clarity, and structure.
        </p>
      </header>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="essayContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Essay Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your essay here..."
                        className="min-h-[300px] text-base"
                        {...field}
                      />
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
                {isLoading ? 'Reviewing...' : 'Review Essay'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generating Feedback...</CardTitle>
              <CardDescription>Our AI is analyzing your essay. Please wait a moment.</CardDescription>
            </CardHeader>
            <CardContent>
               <Progress value={50} className="w-full animate-pulse" />
            </CardContent>
          </Card>
        </div>
      )}

      {review && (
        <div className="space-y-6">
          <h2 className="text-2xl font-headline font-semibold">Review Results</h2>
          <Card>
            <CardHeader>
                <CardTitle>Overall Score</CardTitle>
                <div className="rounded-lg bg-muted p-4 my-2">
                    <div className="flex items-baseline justify-center gap-2">
                        <span className="text-5xl font-bold tracking-tighter">{Math.round(review.overallScore * 10)}</span>
                        <span className="text-xl text-muted-foreground">%</span>
                    </div>
                </div>
                <Progress value={review.overallScore * 10} className="w-full" />
            </CardHeader>
            <CardContent>
                <h3 className="font-semibold mb-2">Suggestions for Improvement:</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{review.suggestionsForImprovement}</p>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Grammar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{review.grammarFeedback}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Clarity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{review.clarityFeedback}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{review.structureFeedback}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
