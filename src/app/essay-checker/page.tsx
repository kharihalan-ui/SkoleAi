'use client';

import { useState, useEffect } from 'react';
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
import { cn } from '@/lib/utils';

const formSchema = z.object({
  essayContent: z.string().min(50, {
    message: 'Essay must be at least 50 characters.',
  }),
});

export default function EssayCheckerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [review, setReview] = useState<EssayReviewOutput | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      essayContent: '',
    },
  });
  
  useEffect(() => {
    if (review) {
      const score = Math.round(review.overallScore * 10);
      const timer = setTimeout(() => setProgressValue(score), 100);
      return () => clearTimeout(timer);
    } else {
      setProgressValue(0);
    }
  }, [review]);


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

  const getScoreColorClasses = (score: number): { text: string; bg: string; bgMuted: string } => {
    if (score < 40) {
      return { text: 'text-destructive', bg: 'bg-destructive', bgMuted: 'bg-destructive/10' };
    }
    if (score < 70) {
      return { text: 'text-chart-3', bg: 'bg-chart-3', bgMuted: 'bg-chart-3/10' };
    }
    return { text: 'text-primary', bg: 'bg-primary', bgMuted: 'bg-primary/10' };
  };

  const scoreColorClasses = review ? getScoreColorClasses(review.overallScore * 10) : { text: '', bg: '', bgMuted: 'bg-muted' };

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
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
          <h2 className="text-2xl font-headline font-semibold">Review Results</h2>
          <Card>
            <CardHeader>
                <CardTitle>Overall Score</CardTitle>
                <div className={cn("rounded-lg p-4 my-2 transition-colors duration-500", scoreColorClasses.bgMuted)}>
                    <div className="flex items-baseline justify-center gap-2">
                        <span className={cn("text-5xl font-bold tracking-tighter transition-colors duration-500", scoreColorClasses.text)}>
                            {Math.round(review.overallScore * 10)}
                        </span>
                        <span className={cn("text-xl transition-colors duration-500", scoreColorClasses.text, "opacity-70")}>%</span>
                    </div>
                </div>
                <Progress value={progressValue} indicatorClassName={scoreColorClasses.bg} />
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
