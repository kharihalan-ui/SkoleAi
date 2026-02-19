'use client';

import { useState, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { analyzeImageContent, type ImageContentAnalyzerOutput } from '@/ai/flows/image-content-analyzer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import NextImage from 'next/image';

const formSchema = z.object({
  prompt: z.string().min(3, {
    message: 'Prompt must be at least 3 characters.',
  }),
});

export default function ImageAnalyzerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImageContentAnalyzerOutput | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: 'Describe this image.',
    },
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!imageData) {
      toast({
        title: 'No Image',
        description: 'Please upload an image to analyze.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const response = await analyzeImageContent({
        photoDataUri: imageData,
        prompt: values.prompt,
      });
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to analyze the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">Image Analyzer</h1>
        <p className="text-muted-foreground mt-2">
          Upload an image and ask the AI to describe it or extract text.
        </p>
      </header>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <FormLabel htmlFor="image-upload">Upload Image</FormLabel>
                   <Input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="pt-2"/>
                  {imagePreview && (
                    <div className="mt-4 border rounded-lg p-2 aspect-video relative">
                      <NextImage src={imagePreview} alt="Image preview" fill objectFit="contain" />
                    </div>
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Question</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Extract all text from this slide." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isLoading || !imagePreview}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                {isLoading ? 'Analyzing...' : 'Analyze Image'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Analyzing Image...</CardTitle>
            <CardDescription>Our AI is looking at your image. Please wait a moment.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      )}


      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{result.analysisResult}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
