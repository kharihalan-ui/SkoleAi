'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateQuiz, type QuizGeneratorOutput } from '@/ai/flows/quiz-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  studyMaterial: z.string().min(50, { message: 'At least 50 characters.' }),
  questionCount: z.number().min(3).max(20),
});

export default function QuizPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QuizGeneratorOutput | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { studyMaterial: '', questionCount: 5 },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setSelectedAnswers({});
    setShowResults(false);
    try {
      const response = await generateQuiz(values);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to generate quiz.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  const score = result && showResults
    ? result.questions.filter((q, i) => selectedAnswers[i] === q.correctAnswer).length
    : null;

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in-50 duration-500">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">Quiz Generator</h1>
        <p className="text-muted-foreground mt-2">
          Paste study material and get a multiple-choice quiz to test your knowledge.
        </p>
      </header>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="studyMaterial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Study Material</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Paste your notes, textbook excerpt, or article..." className="min-h-[180px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="questionCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions</FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        min={3}
                        max={20}
                        className="w-24 rounded-md border border-input bg-background px-3 py-2"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                {isLoading ? 'Generating...' : 'Generate Quiz'}
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

      {result && result.questions.length > 0 && (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-headline font-semibold">Your Quiz</h2>
            {!showResults && (
              <Button onClick={() => setShowResults(true)} disabled={Object.keys(selectedAnswers).length < result.questions.length}>
                Submit & Check Answers
              </Button>
            )}
            {showResults && score !== null && (
              <span className="text-lg font-semibold text-primary">
                Score: {score}/{result.questions.length}
              </span>
            )}
          </div>
          {result.questions.map((q, idx) => (
            <Card key={idx} className={cn(
              showResults && selectedAnswers[idx] && selectedAnswers[idx] !== q.correctAnswer && 'border-destructive/50'
            )}>
              <CardHeader>
                <CardTitle className="text-base">Q{idx + 1}. {q.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {q.options.map((opt) => {
                  const isSelected = selectedAnswers[idx] === opt;
                  const isCorrect = opt === q.correctAnswer;
                  const showCorrect = showResults && isCorrect;
                  const showWrong = showResults && isSelected && !isCorrect;
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={showResults}
                      onClick={() => setSelectedAnswers((s) => ({ ...s, [idx]: opt }))}
                      className={cn(
                        'w-full text-left p-4 rounded-lg border transition-colors',
                        !showResults && 'hover:bg-muted/50',
                        isSelected && !showResults && 'border-primary bg-primary/10',
                        showCorrect && 'border-primary bg-primary/20',
                        showWrong && 'border-destructive bg-destructive/20'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {showResults && (showCorrect ? <Check className="size-5 text-primary" /> : showWrong ? <X className="size-5 text-destructive" /> : null)}
                        {opt}
                      </div>
                    </button>
                  );
                })}
                {showResults && (
                  <p className="text-sm text-muted-foreground mt-3">
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
