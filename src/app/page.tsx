import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const features = [
  {
    title: 'Essay Checker',
    description: 'Get AI-powered feedback on your writing.',
    href: '/essay-checker',
    image: PlaceHolderImages.find((img) => img.id === 'essay-checker'),
  },
  {
    title: 'Smart Notes',
    description: 'Organize your thoughts and ideas effortlessly.',
    href: '/notes',
    image: PlaceHolderImages.find((img) => img.id === 'smart-notes'),
  },
  {
    title: 'AI Flashcards',
    description: 'Generate flashcards from your study materials.',
    href: '/flashcards',
    image: PlaceHolderImages.find((img) => img.id === 'ai-flashcards'),
  },
  {
    title: 'Video Notes',
    description: 'Summarize and transcribe educational videos.',
    href: '/video-notes',
    image: PlaceHolderImages.find((img) => img.id === 'video-notes'),
  },
  {
    title: 'Image Analyzer',
    description: 'Extract text and insights from images.',
    href: '/image-analyzer',
    image: PlaceHolderImages.find((img) => img.id === 'image-analyzer'),
  },
  {
    title: 'Chat Assistant',
    description: 'Your personal AI tutor for any subject.',
    href: '/chat',
    image: PlaceHolderImages.find((img) => img.id === 'chat-assistant'),
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-headline font-bold tracking-tight">
            Welcome to ScholarAI
          </h1>
          <p className="text-muted-foreground mt-2">
            Your all-in-one AI-powered personal school helper.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link href={feature.href} key={feature.title} className="group">
              <Card className="overflow-hidden h-full flex flex-col transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                {feature.image && (
                  <div className="aspect-video overflow-hidden">
                    <Image
                      src={feature.image.imageUrl}
                      alt={feature.image.description}
                      data-ai-hint={feature.image.imageHint}
                      width={600}
                      height={400}
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="font-headline flex items-center justify-between">
                    {feature.title}
                    <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
