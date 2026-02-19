'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateFlashcards, type FlashcardGeneratorOutput } from '@/ai/flows/flashcard-generator';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
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
import { cn } from '@/lib/utils';

const formSchema = z.object({
  studyMaterial: z.string().min(20, {
    message: 'Study material must be at least 20 characters.',
  }),
});

interface FlashcardProps {
  term: string;
  definition: string;
}

function Flashcard({ term, definition }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="[perspective:1000px] w-full aspect-[3/2] cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          'relative h-full w-full rounded-lg shadow-md transition-transform duration-500 [transform-style:preserve-3d] group-hover:shadow-primary/20 group-hover:shadow-lg',
          isFlipped && '[transform:rotateY(180deg)]'
        )}
      >
        <div className="absolute flex h-full w-full items-center justify-center rounded-lg bg-card p-6 [backface-visibility:hidden]">
          <h3 className="text-xl font-semibold text-center">{term}</h3>
        </div>
        <div className="absolute flex h-full w-full items-center justify-center rounded-lg bg-card p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-muted-foreground text-center">{definition}</p>
        </div>
      </div>
    </div>
  );
}

export default function FlashcardsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FlashcardGeneratorOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studyMaterial: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateFlashcards(values);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to generate flashcards. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in-50 duration-500">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">AI Flashcards</h1>
        <p className="text-muted-foreground mt-2">
          Paste your study material, and we'll automatically create flashcards for you.
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
                    <FormLabel className="sr-only">Study Material</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your notes, an article, or any study material..."
                        className="min-h-[200px] text-base"
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
                {isLoading ? 'Generating...' : 'Generate Flashcards'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
          <div className="text-center text-muted-foreground">
            <Loader2 className="mx-auto my-4 h-8 w-8 animate-spin" />
            <p>Generating your flashcards...</p>
          </div>
      )}

      {result && result.flashcards.length > 0 && (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <h2 className="text-2xl font-headline font-semibold">Your Flashcards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {result.flashcards.map((flashcard, index) => (
                    <div key={index} className='animate-in fade-in-50 slide-in-from-bottom-5' style={{animationDelay: `${index*50}ms`}}>
                        <Flashcard term={flashcard.term} definition={flashcard.definition} />
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
