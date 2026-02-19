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
import { Loader2, Wand2, Upload, File, X } from 'lucide-react';

const formSchema = z.object({
  prompt: z.string().min(3, {
    message: 'Prompt must be at least 3 characters.',
  }),
});

export default function ImageAnalyzerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImageContentAnalyzerOutput | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
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
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setImageData(null);
    setFileName(null);
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }


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
                  <FormLabel>Upload Image</FormLabel>
                   {!imageData ? (
                     <div className="relative">
                        <label htmlFor="image-upload" className="cursor-pointer relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg hover:bg-muted transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                          </div>
                          <Input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                        </label>
                      </div>
                   ) : (
                     <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div className='flex items-center gap-2'>
                           <File className="size-5 text-muted-foreground"/>
                           <span className="text-sm font-medium truncate">{fileName}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={removeImage} className="size-7">
                          <X className="size-4"/>
                        </Button>
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

              <Button type="submit" disabled={isLoading || !imageData}>
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
        <Card className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
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
