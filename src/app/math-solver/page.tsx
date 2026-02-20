'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { solveMathProblem, type MathSolverOutput } from '@/ai/flows/math-solver';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';

const formSchema = z.object({
  problem: z.string().min(3, { message: 'Enter a math problem.' }),
});

export default function MathSolverPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MathSolverOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { problem: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await solveMathProblem(values);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to solve problem.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in-50 duration-500">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">Math Solver</h1>
        <p className="text-muted-foreground mt-2">
          Get step-by-step solutions for algebra, geometry, calculus, and more.
        </p>
      </header>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="problem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Math Problem</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Solve x² + 5x + 6 = 0" className="text-lg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                {isLoading ? 'Solving...' : 'Solve'}
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
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{result.answer}</p>
            </CardContent>
          </Card>
          {result.steps && result.steps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Step-by-Step Solution</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  {result.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
          {result.explanation && (
            <Card>
              <CardHeader>
                <CardTitle>Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{result.explanation}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
