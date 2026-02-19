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
import { Loader2, Wand2, ArrowRight } from 'lucide-react';
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
      setProgressValue(0); // Reset for animation
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
      return { text: 'text-chart-4', bg: 'bg-chart-4', bgMuted: 'bg-chart-4/10' };
    }
    return { text: 'text-primary', bg: 'bg-primary', bgMuted: 'bg-primary/10' };
  };

  const scoreColorClasses = review ? getScoreColorClasses(review.overallScore * 10) : getScoreColorClasses(0);

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in-50 duration-500">
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
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Wand2 />
                )}
                <span>{isLoading ? 'Reviewing...' : 'Review Essay'}</span>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="text-center">
            <CardContent className="pt-6">
                <Loader2 className="mx-auto my-4 h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Generating feedback, please wait...</p>
            </CardContent>
        </Card>
      )}

      {review && (
        <div className="space-y-6">
          <h2 className="text-2xl font-headline font-semibold">Review Results</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 flex flex-col justify-between animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                <CardHeader>
                    <CardTitle>Overall Score</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center">
                    <div className={cn("relative flex items-center justify-center rounded-full size-48 my-4 transition-colors duration-500", scoreColorClasses.bgMuted)}>
                        <div className={cn("absolute inset-2 rounded-full", scoreColorClasses.bgMuted)} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className={cn("text-6xl font-bold tracking-tighter transition-colors duration-500", scoreColorClasses.text)}>
                                {Math.round(review.overallScore * 10)}
                            </span>
                             <span className={cn("text-2xl transition-colors duration-500", scoreColorClasses.text, "opacity-70", "mt-2 ml-1")}>%</span>
                        </div>
                    </div>
                    <Progress value={progressValue} indicatorClassName={cn(scoreColorClasses.bg, "transition-all duration-1000 ease-out")} className="h-2" />
                </CardContent>
            </Card>
            <Card className="lg:col-span-2 animate-in fade-in-50 slide-in-from-bottom-5 duration-500 delay-100">
                <CardHeader>
                    <CardTitle>Suggestions for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap text-base leading-relaxed">{review.suggestionsForImprovement}</p>
                </CardContent>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500 delay-200">
              <CardHeader>
                <CardTitle>Grammar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{review.grammarFeedback}</p>
              </CardContent>
            </Card>
            <Card className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500 delay-300">
              <CardHeader>
                <CardTitle>Clarity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{review.clarityFeedback}</p>
              </CardContent>
            </Card>
            <Card className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500 delay-400">
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
