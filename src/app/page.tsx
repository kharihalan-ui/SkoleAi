import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { ArrowRight, PenSquare, Notebook, GraduationCap, Film, Scan, Bot } from 'lucide-react';

const features = [
  {
    title: 'Essay Checker',
    description: 'Get AI-powered feedback on your writing.',
    href: '/essay-checker',
    icon: PenSquare,
  },
  {
    title: 'Smart Notes',
    description: 'Organize your thoughts and ideas effortlessly.',
    href: '/notes',
    icon: Notebook,
  },
  {
    title: 'AI Flashcards',
    description: 'Generate flashcards from your study materials.',
    href: '/flashcards',
    icon: GraduationCap,
  },
  {
    title: 'Video Notes',
    description: 'Summarize and transcribe educational videos.',
    href: '/video-notes',
    icon: Film,
  },
  {
    title: 'Image Analyzer',
    description: 'Extract text and insights from images.',
    href: '/image-analyzer',
    icon: Scan,
  },
  {
    title: 'Chat Assistant',
    description: 'Your personal AI tutor for any subject.',
    href: '/chat',
    icon: Bot,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 md:p-8 animate-in fade-in-50 duration-500">
        <header className="mb-8">
          <h1 className="text-4xl font-headline font-bold tracking-tight">
            Welcome to ScholarAI
          </h1>
          <p className="text-muted-foreground mt-2">
            Your all-in-one AI-powered personal school helper.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={feature.title} className="animate-in fade-in-50 zoom-in-95" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}>
              <Link href={feature.href} className="group">
                <Card className="h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 group-hover:border-primary/50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <feature.icon className="size-10 text-muted-foreground/30 transition-colors duration-300 group-hover:text-primary" />
                      <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardTitle className="font-headline mb-2">{feature.title}</CardTitle>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
