'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateStudyPlan, type StudyPlanOutput } from '@/ai/flows/study-plan-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Calendar } from 'lucide-react';

const formSchema = z.object({
  subject: z.string().min(2, { message: 'Enter a subject.' }),
  timeframe: z.string().min(2, { message: 'e.g., 1 week, 2 days' }),
  currentLevel: z.string().optional(),
});

export default function StudyPlanPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<StudyPlanOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { subject: '', timeframe: '1 week', currentLevel: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateStudyPlan({
        subject: values.subject,
        timeframe: values.timeframe,
        currentLevel: values.currentLevel || undefined,
      });
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to generate plan.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in-50 duration-500">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">Study Plan Generator</h1>
        <p className="text-muted-foreground mt-2">
          Get a personalized day-by-day study plan for any subject.
        </p>
      </header>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject / Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Biology Chapter 5, Calculus" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeframe</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1 week, 3 days" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Level (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., beginner, familiar with basics" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                {isLoading ? 'Generating...' : 'Generate Plan'}
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
          {result.tips && result.tips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Study Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {result.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          <h2 className="text-2xl font-headline font-semibold">Your Plan</h2>
          <div className="space-y-4">
            {result.plan?.map((day, idx) => (
              <Card key={idx} className="animate-in fade-in-50 slide-in-from-bottom-5" style={{ animationDelay: `${idx * 50}ms` }}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-5 text-primary" />
                    <CardTitle>{day.day}</CardTitle>
                  </div>
                  <p className="text-sm text-primary font-medium">{day.focus}</p>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {day.tasks?.map((task, i) => (
                      <li key={i}>{task}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground/80 mt-2">~{day.estimatedMinutes} min</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
