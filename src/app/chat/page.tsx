'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { academicChatAssistant } from '@/ai/flows/academic-chat-assistant';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

const formSchema = z.object({
  message: z.string().min(1, { message: 'Message cannot be empty.' }),
});

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: '' },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages, isLoading]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    const userMessage: Message = { role: 'user', content: values.message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    form.reset();

    try {
      const assistantResponse = await academicChatAssistant(values);
      const assistantMessage: Message = { role: 'assistant', content: assistantResponse.answer };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive',
      });
      // remove the user message if the API fails
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="h-screen w-full flex flex-col bg-background animate-in fade-in-50">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-headline font-bold tracking-tight flex items-center gap-2">
          <Bot className="text-primary"/> Chat Assistant
        </h1>
      </header>

      <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-4 md:p-6 space-y-6">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 rounded-lg bg-muted/50 mt-20">
                    <Sparkles className="size-10 mb-4 text-primary" />
                    <h2 className="text-xl font-semibold">Start a conversation</h2>
                    <p>Ask about a historical event, a scientific concept, or for help with a math problem.</p>
                </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-500',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className='shadow'>
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-2xl rounded-lg px-4 py-3 shadow-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card'
                  )}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <Avatar className='shadow'>
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
                 <div className='flex items-start gap-3 justify-start animate-in fade-in-0 slide-in-from-bottom-4 duration-500'>
                     <Avatar className='shadow'>
                        <AvatarFallback><Bot /></AvatarFallback>
                     </Avatar>
                     <div className="max-w-md rounded-lg px-4 py-3 bg-card shadow-sm flex items-center">
                        <div className="flex items-center space-x-1">
                            <span className="size-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="size-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="size-2 bg-muted-foreground/50 rounded-full animate-bounce"></span>
                        </div>
                     </div>
                 </div>
            )}
          </div>
        </ScrollArea>
      <div className="border-t p-4 bg-background/95 backdrop-blur-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-4 max-w-4xl mx-auto">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input 
                        placeholder="Ask a question..." 
                        {...field} 
                        disabled={isLoading} 
                        className="text-base rounded-full h-12 px-6"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon" disabled={isLoading} className="rounded-full size-12">
                 <Send className='size-5'/>
              </Button>
            </form>
          </Form>
        </div>
    </div>
  );
}
